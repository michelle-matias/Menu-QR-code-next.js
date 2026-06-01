/* =====================
   Menu4U — QR Code Generator
   script.js
   ===================== */

(function () {
    'use strict';

    /* --------------------
       STATE
       -------------------- */
    var state = {
        ec: 'M',
        style: 'square',
        logoData: null
    };

    /* --------------------
       DOM REFERENCES
       -------------------- */
    var els = {
        canvas: document.getElementById('qr-canvas'),
        qrName: document.getElementById('qr-name'),
        qrUrl: document.getElementById('qr-url'),
        prevUrl: document.getElementById('prev-url'),
        colorFg: document.getElementById('c-fg'),
        colorBg: document.getElementById('c-bg'),
        hexFg: document.getElementById('hex-fg'),
        hexBg: document.getElementById('hex-bg'),
        logoFile: document.getElementById('logo-file'),
        lmoPreview: document.getElementById('lmo-preview'),
        lmoIcon: document.getElementById('lmo-icon'),
        lmoLabel: document.getElementById('lmo-label'),
        btnGen: document.getElementById('btn-gen'),
        btnPng: document.getElementById('btn-png'),
        btnSvg: document.getElementById('btn-svg'),
        btnPrint: document.getElementById('btn-print'),
        stylePills: document.querySelectorAll('#style-pills .m4u-pill'),
        ecPills: document.querySelectorAll('#ec-pills .m4u-pill'),
        dlBtns: document.querySelectorAll('.m4u-dl-btn')
    };

    /* --------------------
       HELPERS
       -------------------- */
    function getFg() { return els.colorFg.value; }
    function getBg() { return els.colorBg.value; }
    function getUrl() { return els.qrUrl.value.trim() || 'menuqr.app/ocantinho'; }
    function getName() { return els.qrName.value.trim() || 'QR Code'; }

    /* --------------------
       QR GENERATION
       -------------------- */
    function generateQR(url, fg, bg, ecLevel, callback) {
        QRCode.toCanvas(els.canvas, url, {
            width: 160,
            margin: 2,
            color: { dark: fg, light: bg },
            errorCorrectionLevel: ecLevel
        }, function (err) {
            if (!err && state.logoData) overlayLogo();
            if (callback) callback(err);
        });
    }

    function renderQR() {
        els.prevUrl.textContent = getUrl();
        generateQR(getUrl(), getFg(), getBg(), state.ec);
    }

    /* --------------------
       LOGO OVERLAY
       -------------------- */
    function overlayLogo() {
        var ctx = els.canvas.getContext('2d');
        var img = new Image();
        img.onload = function () {
            var size = 30;
            var x = (els.canvas.width - size) / 2;
            var y = (els.canvas.height - size) / 2;
            // white padding behind logo
            ctx.fillStyle = getBg();
            ctx.beginPath();
            ctx.roundRect(x - 4, y - 4, size + 8, size + 8, 5);
            ctx.fill();
            ctx.drawImage(img, x, y, size, size);
        };
        img.src = state.logoData;
    }

    /* --------------------
       DOWNLOAD HELPERS
       -------------------- */
    function downloadPNG(filename) {
        var link = document.createElement('a');
        link.download = filename + '.png';
        link.href = els.canvas.toDataURL('image/png');
        link.click();
    }

    function downloadSVG(url, filename) {
        QRCode.toString(url, {
            type: 'svg',
            width: 200,
            margin: 2,
            color: { dark: getFg(), light: getBg() }
        }, function (err, svgString) {
            if (err || !svgString) {
                alert('Erro ao gerar SVG.');
                return;
            }
            var blob = new Blob([svgString], { type: 'image/svg+xml' });
            var link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = filename + '.svg';
            link.click();
            URL.revokeObjectURL(link.href);
        });
    }

    function printQR() {
        var win = window.open('', '_blank');
        if (!win) {
            alert('Por favor permite popups para imprimir.');
            return;
        }
        var imgSrc = els.canvas.toDataURL('image/png');
        win.document.write(
            '<!DOCTYPE html><html><head><title>' + getName() + '</title>' +
            '<style>body{font-family:sans-serif;text-align:center;padding:2rem;}' +
            'img{max-width:280px;display:block;margin:0 auto 1rem;}' +
            'h2{margin-bottom:1rem;font-weight:500;}' +
            'p{color:#888;font-size:13px;}</style></head><body>' +
            '<h2>' + getName() + '</h2>' +
            '<img src="' + imgSrc + '" alt="QR Code">' +
            '<p>' + getUrl() + '</p>' +
            '</body></html>'
        );
        win.document.close();
        win.focus();
        win.print();
    }

    /* --------------------
       TABLE ROW DOWNLOAD
       -------------------- */
    function handleTableDownload(btn) {
        var url = btn.getAttribute('data-url');
        var name = btn.getAttribute('data-name');
        if (!url || !name) return;

        // generate on a temp canvas, then download
        var tempCanvas = document.createElement('canvas');
        tempCanvas.width = 200;
        tempCanvas.height = 200;

        QRCode.toCanvas(tempCanvas, url, {
            width: 200,
            margin: 2,
            color: { dark: '#1a1a1a', light: '#ffffff' },
            errorCorrectionLevel: 'M'
        }, function (err) {
            if (err) { alert('Erro ao gerar QR.'); return; }
            var link = document.createElement('a');
            link.download = name + '.png';
            link.href = tempCanvas.toDataURL('image/png');
            link.click();
        });
    }


    /* --------------------
       EVENT LISTENERS
       -------------------- */

    // Generate button
    els.btnGen.addEventListener('click', renderQR);

    // URL input — live update pill
    els.qrUrl.addEventListener('input', function () {
        els.prevUrl.textContent = getUrl();
    });

    // Color pickers
    els.colorFg.addEventListener('input', function () {
        els.hexFg.textContent = this.value;
        renderQR();
    });

    els.colorBg.addEventListener('input', function () {
        els.hexBg.textContent = this.value;
        renderQR();
    });


    // Logo file upload
    els.logoFile.addEventListener('change', function (e) {
        var file = e.target.files[0];
        if (!file) return;

        var reader = new FileReader();
        reader.onload = function (ev) {
            state.logoData = ev.target.result;
            els.lmoPreview.src = state.logoData;
            els.lmoPreview.style.display = 'block';
            els.lmoIcon.style.display = 'none';
            els.lmoLabel.textContent = file.name;
            renderQR();
        };
        reader.readAsDataURL(file);
    });

    // Download PNG
    els.btnPng.addEventListener('click', function () {
        downloadPNG(getName());
    });

    // Download SVG
    els.btnSvg.addEventListener('click', function () {
        downloadSVG(getUrl(), getName());
    });

    // Print
    els.btnPrint.addEventListener('click', printQR);

    // Table row download buttons
    els.dlBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
            handleTableDownload(btn);
        });
    });

    /* --------------------
       INIT
       -------------------- */
    // Wait for QRCode library to be ready
    function init() {
        if (typeof QRCode !== 'undefined') {
            renderQR();
        } else {
            setTimeout(init, 100);
        }
    }

    init();

})();