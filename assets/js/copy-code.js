document.addEventListener('DOMContentLoaded', () => {
    // Check if the copy button feature is enabled via a data attribute on the body
    // This data attribute is set in baseof.html based on config.toml param
    if (document.body.dataset.enableCodeCopyButton !== 'true') {
        return;
    }

    // Find all <pre> elements, which contain the Chroma-highlighted <code> blocks
    const codeBlocks = document.querySelectorAll('pre');

    codeBlocks.forEach(pre => {
        // Ensure there's a <code> element inside the <pre>
        const code = pre.querySelector('code');
        if (!code) return;

        const button = document.createElement('button');
        button.className = 'copy-code-button';
        button.type = 'button';
        button.innerText = 'Copy';

        button.addEventListener('click', () => {
            // Get the text content from the <code> element
            const textToCopy = code.innerText;
            navigator.clipboard.writeText(textToCopy).then(() => {
                button.innerText = 'Copied!';
                setTimeout(() => {
                    button.innerText = 'Copy';
                }, 2000);
            }).catch(err => {
                console.error('Failed to copy text: ', err);
            });
        });

        // Position the button relative to the <pre> element
        pre.style.position = 'relative';
        pre.appendChild(button);
    });
});