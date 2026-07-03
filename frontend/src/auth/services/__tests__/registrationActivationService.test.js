import { describe, it, expect } from 'vitest';
import * as registrationActivationService from '../registrationActivationService';

describe('registrationActivationService', () => {
  it('exports registration activation service', () => {
    expect(registrationActivationService).toBeDefined();
  });
});
