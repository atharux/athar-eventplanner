/* Faithful JS port of agents/event_ops/schemas/engine.py's apply_rules().
   Runs live in the browser against the SAME {version, data, constraints}
   shape the Python engine consumes, so the Pre-Flight tab can be an
   editable, instantly-recomputing view instead of a static pre-generated
   file. Keep this in lockstep with engine.py — any rule change there
   should be mirrored here (and vice versa). Only the human-readable
   violation strings differ cosmetically (e.g. list formatting); every
   threshold and piece of logic is identical. */

function mins(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

function parseWindow(w) {
  if (typeof w === 'string') {
    const [start, end] = w.split('-');
    return [start.trim(), end.trim()];
  }
  return [w.start, w.end];
}

function windowsOverlap(a, b) {
  const [aStart, aEnd] = parseWindow(a);
  const [bStart, bEnd] = parseWindow(b);
  return mins(aStart) < mins(bEnd) && mins(bStart) < mins(aEnd);
}

function windowCovers(outer, inner) {
  const [oStart, oEnd] = parseWindow(outer);
  const [iStart, iEnd] = parseWindow(inner);
  return mins(oStart) <= mins(iStart) && mins(oEnd) >= mins(iEnd);
}

function isPlaceholder(name) {
  return String(name).trim().toUpperCase().startsWith('REPLACE');
}

function rolesOf(volunteer) {
  const r = volunteer.roles ?? volunteer.role ?? [];
  return Array.isArray(r) ? r : [r];
}

function availabilityOf(volunteer) {
  const a = volunteer.availability ?? [];
  return Array.isArray(a) ? a : [a];
}

export function runPreflight(input) {
  const data = input.data || {};
  const constraints = input.constraints || {};
  const violations = [];
  const actions = [];
  const risks = [];

  // ---------------- BUDGET ----------------
  const budgetOut = {};
  const spend = data.budget?.committed_spend || {};
  const rules = constraints.budget || {};
  const committedTotal = Object.values(spend).reduce((a, b) => a + b, 0);
  const ceiling = rules.total_ceiling ?? 0;
  const hardStopAt = rules.hard_stop_threshold_eur ?? (ceiling * (rules.hard_stop_threshold ?? 1.0));

  budgetOut.committed_total = committedTotal;
  budgetOut.total_ceiling = ceiling;
  budgetOut.headroom = ceiling - committedTotal;
  budgetOut.hard_stop_at = hardStopAt;
  budgetOut.hard_stop_breached = hardStopAt > 0 && committedTotal >= hardStopAt;

  if (budgetOut.hard_stop_breached) {
    violations.push(`BUDGET: committed spend ${committedTotal} EUR breached the absolute hard stop of ${hardStopAt} EUR — block all further commitments`);
    actions.push(`Freeze all new commitments now; bring committed spend back under ${hardStopAt} EUR or renegotiate the hard stop`);
  } else if (committedTotal > ceiling) {
    violations.push(`BUDGET: committed spend ${committedTotal} EUR exceeds planned ceiling ${ceiling} EUR (hard stop at ${hardStopAt} EUR)`);
    actions.push(`Reduce committed spend by ${committedTotal - ceiling} EUR or raise the planned ceiling`);
  } else if (ceiling > 0 && committedTotal >= 0.8 * ceiling) {
    risks.push(`BUDGET: committed spend ${committedTotal} EUR at >=80% of planned ceiling ${ceiling} EUR`);
  }

  const categoryStatus = {};
  for (const [cat, cap] of Object.entries(rules.category_ceilings || {})) {
    const spent = spend[cat] ?? 0;
    categoryStatus[cat] = { committed: spent, ceiling: cap, over: spent > cap };
    if (spent > cap) {
      violations.push(`BUDGET: category '${cat}' committed ${spent} EUR exceeds category ceiling ${cap} EUR`);
      actions.push(`Cut '${cat}' spend by ${spent - cap} EUR or raise its ceiling by the same amount`);
    } else if (cap > 0 && spent >= 0.8 * cap) {
      risks.push(`BUDGET: category '${cat}' at ${spent}/${cap} EUR (>=80% of category ceiling)`);
    }
  }
  budgetOut.categories = categoryStatus;

  // ---------------- CAPACITY (only when the schema declares it) ----------------
  let capacityOut = null;
  const capRules = constraints.capacity;
  if (capRules) {
    const attendees = data.expected_attendees ?? 0;
    const maxAtt = capRules.max_attendees ?? 0;
    capacityOut = {
      expected_attendees: attendees,
      max_attendees: maxAtt,
      over: maxAtt > 0 && attendees > maxAtt,
    };
    if (capacityOut.over) {
      violations.push(`CAPACITY: expected attendees ${attendees} exceed venue maximum ${maxAtt}`);
      actions.push(`Reduce the guest list to ${maxAtt} or book a larger space`);
    } else if (maxAtt > 0 && attendees >= 0.9 * maxAtt) {
      risks.push(`CAPACITY: expected attendees ${attendees} at >=90% of venue maximum ${maxAtt}`);
    }
  }

  // ---------------- STAFFING ----------------
  const staffingOut = {};
  const roster = data.staffing?.volunteer_roster || [];
  for (const roleSpec of constraints.staffing?.roles || []) {
    const role = roleSpec.role;
    const required = roleSpec.min_coverage ?? 0;
    const windowsOut = [];
    for (const shift of roleSpec.shift_windows || []) {
      const available = roster
        .filter(v => rolesOf(v).includes(role) && availabilityOf(v).some(a => windowCovers(a, shift)))
        .map(v => v.name);
      // Placeholder (REPLACE) slots are unfilled positions, not people —
      // they never count toward confirmed coverage.
      const covering = available.filter(n => !isPlaceholder(n));
      const unfilled = available.length - covering.length;
      windowsOut.push({
        window: shift, required, confirmed_full_window: covering.length,
        volunteers: covering, unfilled_placeholder_slots: unfilled, met: covering.length >= required,
      });
      if (covering.length < required) {
        violations.push(
          `STAFFING: role '${role}' needs ${required} confirmed volunteer(s) for full window ${shift}, ` +
          `only ${covering.length} confirmed (${covering.length ? covering.join(', ') : 'none'})` +
          (unfilled ? `; ${unfilled} unfilled REPLACE slot(s) on the roster` : '')
        );
        actions.push(
          `Recruit ${required - covering.length} more volunteer(s) for '${role}' covering ${shift}` +
          (unfilled ? ' — start by filling the REPLACE slot(s) already on the roster' : '')
        );
      } else if (unfilled) {
        risks.push(`STAFFING: role '${role}' window ${shift} coverage met, but roster still carries ${unfilled} unfilled REPLACE slot(s)`);
      }
    }
    staffingOut[role] = windowsOut;
  }

  // ---------------- AV / EQUIPMENT ----------------
  const avOut = { missing_dependencies: {}, double_booked: [] };
  const items = Object.fromEntries((data.av_equipment?.items || []).map(i => [i.id, i]));

  for (const [itemId, item] of Object.entries(items)) {
    const missing = (item.requires || []).filter(d => !(d in items) || (items[d].qty ?? 1) < 1);
    if (missing.length) {
      avOut.missing_dependencies[itemId] = missing;
      violations.push(`AV: '${itemId}' (${item.type || 'unknown'}) dependency chain broken — missing from item list: ${missing.join(', ')}`);
      actions.push(`Procure and add to the gear list before the event: ${missing.join(', ')}`);
    }
  }

  for (const [itemId, item] of Object.entries(items)) {
    const assigns = item.assignments || [];
    const qty = item.qty ?? 1;
    for (let i = 0; i < assigns.length; i++) {
      let overlapping = 1;
      for (let j = 0; j < assigns.length; j++) {
        if (j !== i && windowsOverlap(assigns[i], assigns[j])) overlapping++;
      }
      if (overlapping > qty) {
        const booking = assigns[i];
        const [wStart, wEnd] = parseWindow(booking);
        const session = (typeof booking === 'object' && booking.session) || 'unnamed';
        const conflict = { item: itemId, session, window: `${wStart}-${wEnd}`, concurrent_demand: overlapping, qty_available: qty };
        const exists = avOut.double_booked.some(c => JSON.stringify(c) === JSON.stringify(conflict));
        if (!exists) {
          avOut.double_booked.push(conflict);
          violations.push(`AV: '${itemId}' double-booked — ${overlapping} concurrent assignment(s) (${session} ${conflict.window}) but qty=${qty}`);
          actions.push(`Add another '${itemId}' unit or move one booking out of ${conflict.window}`);
        }
      }
    }
  }

  // ---------------- RESULT ----------------
  const validated = {
    event_id: data.event_id, event_name: data.event_name, date: data.date,
    budget: budgetOut,
  };
  if (capacityOut !== null) validated.capacity = capacityOut;
  Object.assign(validated, {
    staffing: staffingOut,
    av_equipment: avOut,
    violations,
    recommended_actions: actions,
    risk_flags: risks,
  });

  return {
    version: '1.0',
    status: violations.length === 0 ? 'approved' : 'blocked',
    result: {
      is_valid: violations.length === 0,
      reason: violations.length === 0 ? 'All constraints satisfied' : `${violations.length} constraint violation(s) detected`,
      validated_data: validated,
    },
  };
}
