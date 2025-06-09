import { ActionIcon } from '@mantine/core';
import { IconCopy, IconCheck } from '@tabler/icons-react';
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';


async function copyPlainMarkdown(markdown: string) {
    const cleaned = markdown
        .replace(/\*\*(.*?)\*\*/g, "$1")    // bỏ **bold**
        .replace(/\*(.*?)\*/g, "$1")        // bỏ *italic*
        .replace(/\\_/g, "_")              // bỏ escape _

    await navigator.clipboard.writeText(cleaned);
}

const ButtonCopyMessage = forwardRef(({ value }: { value: string }, ref) => {
    const [copied, setCopied] = useState(false);;
    const [visible, setCurrentVisible] = useState(false);

    useImperativeHandle(ref, () => ({
        setVisible: (visible: boolean) => setCurrentVisible(visible),
    }));

    useEffect(() => {
        if (!copied) { return }
        const timeout = setTimeout(() => { setCopied(false) }, 3000);
        return () => clearTimeout(timeout);
    }, [copied]);

    return (
        <ActionIcon
            size="md"
            color={copied ? 'teal' : 'gray'}
            variant="subtle"
            onClick={async () => {
                copyPlainMarkdown(value);;
                setCopied(true);
            }}
            style={{
                display: visible ? "" : "none",
                position: 'absolute',
                top: 0,
                right: 0,
                borderBottomRightRadius: 0,
                borderTopLeftRadius: 0
            }}
        >
            {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
        </ActionIcon>
    );
});

ButtonCopyMessage.displayName = 'ButtonCopyMessage';
export default ButtonCopyMessage;

