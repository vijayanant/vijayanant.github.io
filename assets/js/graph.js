(function() {
    const elem = document.getElementById('graph-canvas');
    if (!elem) return;

    // --- DOM Elements ---
    const sidePanel = document.getElementById('side-panel');
    const pTitle = document.getElementById('panel-title');
    const pGroup = document.getElementById('panel-group');
    const pDesc = document.getElementById('panel-description');
    const pLink = document.getElementById('panel-link');
    const graphFiltersOverlay = document.getElementById('graph-filters-overlay');
    const searchInput = document.getElementById('graph-search');
    const btnReset = document.getElementById('btn-reset');
    const btnClosePanel = document.getElementById('btn-close-panel');
    const btnOpenFilters = document.getElementById('btn-open-filters');
    const btnCloseFiltersOverlay = document.getElementById('btn-close-filters-overlay');

    // --- State ---
    let fullData = { nodes: [], links: [] };
    let activeNode = null;
    const nodeColors = { 'essay': '#38bdf8', 'series': '#4ade80', 'tag': '#94a3b8', 'category': '#fbbf24' };

    // --- Graph Init ---
    const Graph = ForceGraph()(elem);
    Graph.d3Force('center', null); 

    // --- Helpers ---
    function getThemeColors() {
        const style = getComputedStyle(document.body);
        return {
            background: style.getPropertyValue('--background-color').trim(),
            text: style.getPropertyValue('--text-color').trim(),
            primary: style.getPropertyValue('--primary-color').trim()
        };
    }

    function syncTheme() {
        const colors = getThemeColors();
        Graph.backgroundColor(colors.background);
        Graph.refresh();
    }

    function updateSidePanel(node) {
        sidePanel.style.display = 'block';
        pTitle.innerText = node.label;
        pGroup.innerText = node.group;
        pDesc.innerText = node.description || `Exploring the connections of ${node.label}`;
        
        const connectionsList = document.getElementById('panel-connections');
        connectionsList.innerHTML = '';
        
        if (node.neighbors) {
            node.neighbors.forEach((neighbor, index) => {
                const link = node.links[index];
                let relType = (link && link.type) ? link.type : 'related';
                if (neighbor.group === 'essay') relType = 'Essay';

                const li = document.createElement('li');
                li.className = 'pillar-post-item';
                li.innerHTML = `<span class="text-muted" style="font-size:0.7rem; text-transform:uppercase;">${relType}</span> ${neighbor.label}`;
                li.style.cursor = 'pointer';
                li.onclick = (e) => {
                    e.stopPropagation();
                    Graph.onNodeClick()(neighbor);
                };
                connectionsList.appendChild(li);
            });
        }

        pLink.style.display = (node.group === 'essay') ? 'inline-flex' : 'none';
        if (node.url) pLink.href = node.url;
    }

    // --- Actions ---
    window.filterByGroup = (group) => {
        if (group === 'essay') {
            const essayNodes = fullData.nodes.filter(n => n.group === 'essay');
            const catNodes = fullData.nodes.filter(n => n.group === 'category');
            const nodes = [...essayNodes, ...catNodes];
            const nodeIds = new Set(nodes.map(n => n.id));
            const links = fullData.links.filter(l => {
                const sId = typeof l.source === 'object' ? l.source.id : l.source;
                const tId = typeof l.target === 'object' ? l.target.id : l.target;
                return nodeIds.has(sId) && nodeIds.has(tId);
            });
            Graph.graphData({ nodes, links });
        } else {
            const nodes = fullData.nodes.filter(n => n.group === group);
            Graph.graphData({ nodes, links: [] });
        }
        Graph.zoomToFit(400, 100);
        if (graphFiltersOverlay) graphFiltersOverlay.style.display = 'none';
    };

    window.resetZoom = () => {
        activeNode = null; 
        const initialNodes = fullData.nodes.filter(n => n.group === 'category' || n.group === 'series');
        Graph.graphData({ nodes: initialNodes, links: [] });
        setTimeout(() => {
            Graph.zoomToFit(400, 80);
            Graph.centerAt(0, 0, 400);
        }, 100);
        sidePanel.style.display = 'none';
    };

    // --- Event Listeners ---
    const observer = new MutationObserver(() => syncTheme());
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    if (btnReset) btnReset.onclick = window.resetZoom;
    if (btnClosePanel) btnClosePanel.onclick = () => sidePanel.style.display = 'none';
    if (btnOpenFilters) btnOpenFilters.onclick = () => graphFiltersOverlay.style.display = 'flex';
    if (btnCloseFiltersOverlay) btnCloseFiltersOverlay.onclick = () => graphFiltersOverlay.style.display = 'none';

    // Click anywhere on overlay background to close
    if (graphFiltersOverlay) {
        graphFiltersOverlay.onclick = (e) => {
            if (e.target === graphFiltersOverlay) graphFiltersOverlay.style.display = 'none';
        };
    }

    // Attach filter logic to legend items
    document.querySelectorAll('.legend-item').forEach(item => {
        item.onclick = () => window.filterByGroup(item.getAttribute('data-group'));
    });

    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                const val = e.target.value.toLowerCase();
                if (!val) return window.resetZoom();
                const matchedNodes = fullData.nodes.filter(n => n.label.toLowerCase().includes(val));
                if (matchedNodes.length > 0) {
                    const matchedIds = new Set(matchedNodes.map(n => n.id));
                    const relatedLinks = fullData.links.filter(l => {
                        const sId = typeof l.source === 'object' ? l.source.id : l.source;
                        const tId = typeof l.target === 'object' ? l.target.id : l.target;
                        return matchedIds.has(sId) || matchedIds.has(tId);
                    });
                    
                    relatedLinks.forEach(l => {
                        matchedIds.add(typeof l.source === 'object' ? l.source.id : l.source);
                        matchedIds.add(typeof l.target === 'object' ? l.target.id : l.target);
                    });

                    Graph.graphData({ 
                        nodes: fullData.nodes.filter(n => matchedIds.has(n.id)), 
                        links: relatedLinks 
                    });
                }
            }, 300);
        });
    }

    // --- Data Loading ---
    fetch('/knowledge-graph.json')
        .then(res => res.json())
        .then(data => {
            fullData = data;
            const nodesById = Object.fromEntries(data.nodes.map(n => [n.id, n]));
            fullData.links.forEach(l => {
                const sourceId = typeof l.source === 'object' ? l.source.id : l.source;
                const targetId = typeof l.target === 'object' ? l.target.id : l.target;
                const a = nodesById[sourceId];
                const b = nodesById[targetId];
                if (a && b) {
                    if (!a.neighbors) a.neighbors = [];
                    if (!b.neighbors) b.neighbors = [];
                    a.neighbors.push(b);
                    b.neighbors.push(a);
                    if (!a.links) a.links = [];
                    if (!b.links) b.links = [];
                    a.links.push(l);
                    b.links.push(l);
                }
            });

            const initialNodes = data.nodes.filter(n => n.group === 'category' || n.group === 'series');
            Graph.graphData({ nodes: initialNodes, links: [] });
            syncTheme(); 
            setTimeout(() => Graph.zoomToFit(400, 100), 500);
        });

    // --- Graph Configuration ---
    Graph.nodeLabel('label')
        .nodeColor(node => nodeColors[node.group] || '#ffffff')
        .linkColor(() => 'rgba(56, 189, 248, 0.2)')
        .linkWidth(2)
        .nodeCanvasObject((node, ctx, globalScale) => {
            const label = node.label;
            const fontSize = 14/globalScale;
            const colors = getThemeColors();
            ctx.font = `bold ${fontSize}px Sans-Serif`;
            
            const size = 8;
            ctx.fillStyle = nodeColors[node.group] || '#ffffff';

            if (node.group === 'essay') {
                ctx.fillRect(node.x - size/2, node.y - size/2, size, size);
            } else if (node.group === 'tag') {
                ctx.beginPath();
                ctx.moveTo(node.x, node.y - size);
                ctx.lineTo(node.x + size, node.y + size/2);
                ctx.lineTo(node.x - size, node.y + size/2);
                ctx.closePath();
                ctx.fill();
            } else if (node.group === 'series') {
                ctx.beginPath();
                for (let i = 0; i < 6; i++) {
                    const angle = Math.PI / 3 * i;
                    ctx.lineTo(node.x + (size+2) * Math.cos(angle), node.y + (size+2) * Math.sin(angle));
                }
                ctx.closePath();
                ctx.fill();
            } else {
                ctx.beginPath();
                ctx.arc(node.x, node.y, size+2, 0, 2 * Math.PI, false);
                ctx.fill();
            }

            if (activeNode && node.id === activeNode.id) {
                ctx.beginPath();
                ctx.arc(node.x, node.y, size + 6, 0, 2 * Math.PI, false);
                ctx.strokeStyle = colors.text;
                ctx.lineWidth = 2/globalScale;
                ctx.stroke();
            }

            const isLandmark = node.group === 'category' || node.group === 'series';
            const shouldShowLabel = isLandmark || globalScale > 3.0 || (activeNode && node.id === activeNode.id);

            if (shouldShowLabel) {
                ctx.textAlign = 'center';
                ctx.textBaseline = 'top';
                ctx.fillStyle = colors.text;
                ctx.fillText(label, node.x, node.y + size + 2);
            }
        })
        .nodePointerAreaPaint((node, color, ctx) => {
            ctx.fillStyle = color;
            const size = 12; 
            if (node.group === 'essay') {
                ctx.fillRect(node.x - size/2, node.y - size/2, size, size);
            } else {
                ctx.beginPath(); ctx.arc(node.x, node.y, size, 0, 2 * Math.PI, false); ctx.fill();
            }
        })
        .onNodeClick(node => {
            activeNode = node;
            const isMobile = window.innerWidth <= 768;
            const zoomLevel = 6;
            
            if (!isMobile) {
                const canvasWidth = elem.clientWidth;
                const targetX = canvasWidth * 0.3; 
                const currentX = canvasWidth / 2;
                const screenOffset = (currentX - targetX) / zoomLevel;
                Graph.centerAt(node.x + screenOffset, node.y, 1000);
            } else {
                Graph.centerAt(node.x, node.y, 1000);
            }
            Graph.zoom(zoomLevel, 1000);

            updateSidePanel(node);

            setTimeout(() => {
                const matchedIds = new Set([node.id]);
                if (node.neighbors) node.neighbors.forEach(n => matchedIds.add(n.id));
                
                const nodes = fullData.nodes.filter(n => matchedIds.has(n.id) || n.group === 'category' || n.group === 'series');
                const links = fullData.links.filter(l => {
                    const sId = typeof l.source === 'object' ? l.source.id : l.source;
                    const tId = typeof l.target === 'object' ? l.target.id : l.target;
                    return matchedIds.has(sId) && matchedIds.has(tId);
                });
                Graph.graphData({ nodes, links });
            }, 200);
        });

    function resize() {
        Graph.width(elem.clientWidth);
        Graph.height(elem.clientHeight);
    }
    window.addEventListener('resize', resize);
    setTimeout(resize, 100);
})();
