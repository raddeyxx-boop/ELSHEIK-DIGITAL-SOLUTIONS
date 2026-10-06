import { describe, expect, it } from 'vitest';
import { initialState, reducer, availableFor } from '../../src/components/case-study/operations-demo/data';

describe('isolated operations demo state',()=>{
  it('shares assignment and status changes with activity and resets all changes',()=>{
    const original=initialState(), id='DEMO-RM-009';
    const assigned=reducer(original,{type:'assign',id,specialistId:'s1'});
    expect(assigned.bookings.find(b=>b.id===id)?.specialistId).toBe('s1');
    expect(assigned.activity[0]).toMatchObject({bookingId:id,type:'SPECIALIST_ASSIGNED'});
    const confirmed=reducer(assigned,{type:'status',id,status:'confirmed'});
    const completed=reducer(confirmed,{type:'status',id,status:'completed'});
    expect(completed.bookings.find(b=>b.id===id)?.status).toBe('completed');
    expect(reducer(completed,{type:'reset'})).toEqual(original);
    expect(original.bookings.find(b=>b.id===id)?.specialistId).toBeNull();
  });
  it('rejects wrong branches, overlapping assignments and terminal-state edits',()=>{
    const state=initialState(), booking=state.bookings.find(b=>b.id==='DEMO-RM-009')!;
    expect(availableFor('s4',booking,state.bookings)).toBe(false);
    expect(reducer(state,{type:'assign',id:booking.id,specialistId:'s4'})).toBe(state);
    const overlap={...booking,id:'conflict',specialistId:'s1'};
    expect(availableFor('s1',booking,[...state.bookings,overlap])).toBe(false);
    expect(reducer(state,{type:'status',id:'DEMO-RM-001',status:'confirmed'})).toBe(state);
    expect(reducer(state,{type:'status',id:booking.id,status:'completed'})).toBe(state);
  });
});
