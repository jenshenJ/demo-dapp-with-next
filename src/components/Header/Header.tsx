import { TonConnectButton } from "@tonconnect/ui-react";
import './header.scss';

export const Header = () => {
    return <header>
        <span>My App with Next.js</span>
        <TonConnectButton />
    </header>
}
