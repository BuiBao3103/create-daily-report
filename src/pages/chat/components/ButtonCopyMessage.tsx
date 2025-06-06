import { ActionIcon } from '@mantine/core';
import { IconCopy, IconCheck } from '@tabler/icons-react';
import { useEffect, useState } from 'react';

export default function ButtonCopyMessage({ value }: { value: string }) {
    const [copied, setCopied] = useState(false);;

    useEffect(() => {
        if (!copied) { return }
        const timeout = setTimeout(() => { setCopied(false) }, 3000);
        return () => clearTimeout(timeout);
    }, [copied]);

    return (
        <ActionIcon
            color={copied ? 'teal' : 'gray'}
            variant="subtle"
            onClick={async () => {
                copyPlainMarkdown(value);;
                setCopied(true);
            }}
        >
            {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
        </ActionIcon>
    );
}

async function copyPlainMarkdown(markdown: string) {
    const cleaned = markdown
        .replace(/\*\*(.*?)\*\*/g, "$1") // bỏ **bold**
        .replace(/\*(.*?)\*/g, "$1")     // bỏ *italic*
        .replace(/\\_/g, "_");           // bỏ escape _

    await navigator.clipboard.writeText(cleaned);
}
