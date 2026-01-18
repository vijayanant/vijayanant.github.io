document.addEventListener('DOMContentLoaded', () => {
    const tabGroups = document.querySelectorAll('.tabs');

    tabGroups.forEach(group => {
        const tabs = group.querySelectorAll('.code-tab');
        if (tabs.length === 0) return;

        const header = document.createElement('div');
        header.className = 'tabs-header';

        tabs.forEach((tab, index) => {
            const button = document.createElement('button');
            button.className = 'tab-btn';
            button.innerText = tab.getAttribute('data-title');
            
            if (index === 0) {
                button.classList.add('active');
                tab.classList.add('active');
            } else {
                tab.style.display = 'none';
            }

            button.addEventListener('click', () => {
                // Deactivate all
                header.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
                tabs.forEach(t => {
                    t.classList.remove('active');
                    t.style.display = 'none';
                });

                // Activate current
                button.classList.add('active');
                tab.classList.add('active');
                tab.style.display = 'block';
            });

            header.appendChild(button);
        });

        group.insertBefore(header, group.firstChild);
    });
});