import { currentUser } from '@/modules/authentication/action';
import { acceptWorkspaceInvite } from '@/modules/invites/action';
import { redirect } from 'next/navigation';
import React from 'react'

const Invite = async ({ params }: { params: Promise<{ token: string }> }) => {
    const { token } = await params;
    const user = await currentUser();

    if (!user) {
        redirect('/sign-in');
    }

    let accepted = false;
    try {
        const invite = await acceptWorkspaceInvite(token);
        accepted = invite.success;
    } catch (error) {
        console.error('Invite could not be accepted:', error);
    }

    return redirect(accepted ? '/' : '/?invite=invalid');

}

export default Invite