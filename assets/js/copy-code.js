document.addEventListener('DOMContentLoaded', () => {
    if (document.body.dataset.enableCodeCopyButton !== 'true') return;

    document.querySelectorAll('.highlight').forEach(highlightDiv => {
        const button = document.createElement('button');
        button.className = 'copy-code-button';
        button.type = 'button';
        button.innerText = 'Copy';
        highlightDiv.style.position = 'relative';
        highlightDiv.appendChild(button);

        button.addEventListener('click', () => {
            const codeElement = highlightDiv.querySelector('code');
            if (!codeElement) return;

            // Each line in your code block is a span with "display: flex"
            const lines = codeElement.querySelectorAll('span[style*="display:flex"], span[style*="display: flex"]');
            
            let textToCopy = '';

            if (lines.length > 0) {
                // Line numbers are present (Inline mode)
                // We map through each flex line and take only the text from the SECOND child (the code)
                textToCopy = Array.from(lines).map(line => {
                    const codePart = line.children[1];
                    // The innerText of the code part likely already includes the newline.
                    return codePart ? codePart.innerText : '';
                }).join(''); // Changed from '\n' to '' to avoid double spacing
            } else {
                // Table mode or No Line Numbers mode
                const tableCode = highlightDiv.querySelector('.lntd:last-child code');
                if (tableCode) {
                    textToCopy = tableCode.innerText;
                } else {
                    textToCopy = codeElement.innerText;
                }
            }

            if (!textToCopy) return;

            navigator.clipboard.writeText(textToCopy.trimEnd()).then(() => {
                button.innerText = 'Copied!';
                setTimeout(() => button.innerText = 'Copy', 2000);
            }).catch(err => console.error('Failed to copy:', err));
        });
    });
});