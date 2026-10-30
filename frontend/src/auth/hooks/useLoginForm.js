import { useMutation } from '@tanstack/react-query';
import { authService } from '../services/authService';

export function useLoginForm() {
    const loginMutation = useMutation({
        mutationFn: ({ email, password, clientId, turnstileToken }) =>
            authService.login(email, password, clientId, turnstileToken),
    });

    return {
        loginMutation
    };
}
