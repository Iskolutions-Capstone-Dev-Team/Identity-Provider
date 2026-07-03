import { describe, it, expect } from 'vitest';
import * as registrationFlowService from '../registrationFlowService';

describe('registrationFlowService', () => {
  it('exports registration flow service', () => {
    expect(registrationFlowService).toBeDefined();
  });
});
