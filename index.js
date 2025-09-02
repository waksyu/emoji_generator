document.addEventListener('DOMContentLoaded', () => {
    // --- STATE ---
    const FONT_OPTIONS = [
        { name: 'まるゴ', value: "'M PLUS Rounded 1c', sans-serif" },
        { name: 'ゴシック', value: "'Noto Sans JP', sans-serif" },
        { name: '明朝', value: "'Shippori Mincho', serif" },
        { name: '手書き風', value: "'Yusei Magic', sans-serif" },
    ];

    let settings = {
        text: 'サン\nプル',
        textColor: '#3b82f6',
        fontFamily: FONT_OPTIONS[0].value,
        backgroundColor: '#FFFFFF',
    };
    let activeTab = 'TextColor';

    // --- DOM ELEMENTS ---
    const canvas = document.getElementById('preview-canvas');
    const ctx = canvas.getContext('2d');
    const textInput = document.getElementById('text-input');
    const downloadLink = document.getElementById('download-link');
    
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabPanels = document.querySelectorAll('.tab-panel');
    const textColorDisabledLabel = document.querySelector('.text-color-disabled-label');
    
    const fontButtons = document.querySelectorAll('.font-button');
    const textColorButtons = document.querySelectorAll('.text-color-button');
    const bgColorButtons = document.querySelectorAll('.bg-color-button');

    // --- CORE FUNCTIONS ---
    const drawEmoji = async () => {
        await document.fonts.ready;
        if (!canvas || !ctx) return;

        const { text, textColor, fontFamily, backgroundColor } = settings;
        const { width, height } = canvas;
        const PADDING = 0;

        ctx.clearRect(0, 0, width, height);

        const isBgActive = backgroundColor !== '#FFFFFF';
        if (isBgActive) {
            ctx.fillStyle = backgroundColor;
            ctx.fillRect(0, 0, width, height);
        }

        ctx.fillStyle = isBgActive ? '#FFFFFF' : textColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const lines = text.split('\n');
        let fontSize = height + 1;
        let longestLine = lines.reduce((a, b) => a.length > b.length ? a : b, '');

        while (fontSize > 8) {
            fontSize--;
            ctx.font = `700 ${fontSize}px ${fontFamily}`;
            const textWidth = ctx.measureText(longestLine).width;
            const lineHeight = fontSize * 1.1;
            const totalTextHeight = lines.length * lineHeight;
            if (textWidth <= width - PADDING && totalTextHeight <= height - PADDING) {
                break;
            }
        }

        const lineHeight = fontSize * 1.1;
        const totalBlockHeight = (lines.length - 1) * lineHeight;
        const startY = (height / 2) - (totalBlockHeight / 2);
        
        lines.forEach((line, index) => {
            ctx.fillText(line, width / 2, startY + (index * lineHeight));
        });

        const dataUrl = canvas.toDataURL('image/png');
        downloadLink.href = dataUrl;
        downloadLink.download = `${settings.text.replace(/\n/g, '') || 'emoji'}.png`;
    };

    const updateUI = () => {
        textInput.value = settings.text;
        
        const isBgActive = settings.backgroundColor !== '#FFFFFF';

        // Update Tabs & Panels
        tabButtons.forEach(button => {
            const tabId = button.dataset.tab;
            const panel = document.getElementById(tabId.toLowerCase() + '-panel');
            const isDisabled = tabId === 'TextColor' && isBgActive;

            button.classList.remove('border-blue-600', 'text-blue-600', 'border-transparent', 'text-gray-500', 'hover:border-gray-300', 'hover:text-gray-700', 'text-gray-300', 'cursor-not-allowed');
            button.disabled = false;

            if (isDisabled) {
                button.classList.add('text-gray-300', 'cursor-not-allowed', 'border-transparent');
                if (tabId === 'TextColor') textColorDisabledLabel.style.display = 'inline';
                button.disabled = true;
            } else {
                if (tabId === 'TextColor') textColorDisabledLabel.style.display = 'none';
                if (activeTab === tabId) {
                    button.classList.add('border-blue-600', 'text-blue-600');
                    if(panel) panel.style.display = 'block';
                } else {
                    button.classList.add('border-transparent', 'text-gray-500', 'hover:border-gray-300', 'hover:text-gray-700');
                    if(panel) panel.style.display = 'none';
                }
            }
        });

        // Update Font Selectors
        fontButtons.forEach(button => {
            button.classList.remove('bg-blue-100', 'border-blue-500');
            button.classList.add('border-gray-300', 'hover:border-gray-400');
            if (button.dataset.font === settings.fontFamily) {
                button.classList.add('bg-blue-100', 'border-blue-500');
            }
        });
        
        // Update Text Color Selectors
        textColorButtons.forEach(button => {
            button.classList.remove('ring-2', 'ring-offset-2', 'ring-blue-500');
            if (button.dataset.color === settings.textColor) {
                button.classList.add('ring-2', 'ring-offset-2', 'ring-blue-500');
            }
        });
        
        // Update BG Color Selectors
        bgColorButtons.forEach(button => {
            button.classList.remove('ring-2', 'ring-offset-2', 'ring-blue-500');
            if (button.dataset.color === settings.backgroundColor) {
                button.classList.add('ring-2', 'ring-offset-2', 'ring-blue-500');
            }
        });
        
        drawEmoji();
    };

    // --- EVENT HANDLERS ---
    const handleTextChange = (e) => {
        settings.text = e.target.value;
        updateUI();
    };
    
    const handleTabClick = (e) => {
        const button = e.currentTarget;
        if (button.disabled) return;
        activeTab = button.dataset.tab;
        updateUI();
    };
    
    const handleFontSelect = (e) => {
        settings.fontFamily = e.currentTarget.dataset.font;
        updateUI();
    };
    
    const handleTextColorSelect = (e) => {
        if (settings.backgroundColor !== '#FFFFFF') return;
        settings.textColor = e.currentTarget.dataset.color;
        updateUI();
    };

    const handleBgColorSelect = (e) => {
        const color = e.currentTarget.dataset.color;
        if (color === '#FFFFFF' && settings.backgroundColor === '#FFFFFF') {
            return;
        }

        const previousBgColor = settings.backgroundColor;
        settings.backgroundColor = color;
        
        if (color !== '#FFFFFF') {
            settings.textColor = '#FFFFFF';
            if (activeTab === 'TextColor') {
                activeTab = 'Font';
            }
        } else {
            // When clearing the background, restore the text color to what the background color was.
            settings.textColor = previousBgColor;
        }
        updateUI();
    };

    // --- INITIALIZATION ---
    const init = () => {
        const urlParams = new URLSearchParams(window.location.search);
        const defaultText = urlParams.get('defaulttext');
        if (defaultText) {
            settings.text = decodeURIComponent(defaultText.replace(/\+/g, ' '));
        }

        textInput.addEventListener('input', handleTextChange);
        tabButtons.forEach(button => button.addEventListener('click', handleTabClick));
        fontButtons.forEach(button => button.addEventListener('click', handleFontSelect));
        textColorButtons.forEach(button => button.addEventListener('click', handleTextColorSelect));
        bgColorButtons.forEach(button => button.addEventListener('click', handleBgColorSelect));
        
        updateUI();
    };

    init();
});
