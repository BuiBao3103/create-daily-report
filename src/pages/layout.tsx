import { ColorSchemeToggle } from "@/components/ColorSchemeToggle/ColorSchemeToggle";
import { AppShell } from "@mantine/core";
import React, { ReactNode } from "react";
import ButtonGoToChatPage from "./chat/components/ButtonGoToChatPage";

const Layout = ({ children }: { children: ReactNode }) => {
    return (
        <AppShell p="md">
            <AppShell.Main mih={0}>
                <ColorSchemeToggle />
                <ButtonGoToChatPage />
                {children}
            </AppShell.Main>
        </AppShell>
    );
};

export default Layout;
