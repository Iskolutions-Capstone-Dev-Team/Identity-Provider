import { describe, it, expect } from 'vitest';
import * as Icons from '../registerIcons';

describe('registerIcons Component', () => {
  it('exports icon components', () => {
    expect(Icons.EmailIcon).toBeDefined();
    expect(Icons.UserIcon).toBeDefined();
    expect(Icons.RoleIcon).toBeDefined();
    expect(Icons.PasswordIcon).toBeDefined();
    expect(Icons.EyeIcon).toBeDefined();
    expect(Icons.EyeSlashIcon).toBeDefined();
  });
});
