import { useMutation } from '@tanstack/react-query';
import { authService } from '../services/authService';

export function useLoginForm() {
    const loginMutation = useMutation({
        mutationFn: ({ email, password, clientId }) => authService.login(email, password, clientId),
    });

    return {
        loginMutation
    };
}
