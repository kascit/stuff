/**
 * Stuff API Core - Shared utilities for all tools
 * Query-string API interface for frontend-only tools
 */

export const API = {
    /**
     * Get query parameter value
     */
    getParam(name) {
        const params = new URLSearchParams(window.location.search);
        return params.get(name);
    },

    /**
     * Get all query parameters as object
     */
    getAllParams() {
        const params = new URLSearchParams(window.location.search);
        const result = {};
        for (const [key, value] of params.entries()) {
            result[key] = value;
        }
        return result;
    },

    /**
     * Set/update query parameter without page reload
     */
    setParam(name, value) {
        const url = new URL(window.location);
        if (value === null || value === '') {
            url.searchParams.delete(name);
        } else {
            url.searchParams.set(name, value);
        }
        window.history.replaceState({}, '', url);
    },

    /**
     * Set multiple params at once
     */
    setParams(params) {
        const url = new URL(window.location);
        Object.entries(params).forEach(([key, value]) => {
            if (value === null || value === '') {
                url.searchParams.delete(key);
            } else {
                url.searchParams.set(key, value);
            }
        });
        window.history.replaceState({}, '', url);
    },

    /**
     * Copy text to clipboard
     */
    async copy(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            // Fallback
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            return true;
        }
    },

    /**
     * Generate shareable URL with current state
     */
    share(params = {}) {
        const url = new URL(window.location);
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                url.searchParams.set(key, value);
            }
        });
        return url.toString();
    },

    /**
     * Show toast notification
     */
    toast(message, type = 'success') {
        const toast = document.createElement('div');
        const colors = {
            success: 'bg-success text-success-content',
            error: 'bg-error text-error-content',
            info: 'bg-info text-info-content'
        };
        toast.className = `fixed bottom-4 right-4 px-4 py-2 rounded-lg shadow-lg ${colors[type]} transition-opacity duration-300`;
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    },

    /**
     * Download text as file
     */
    download(filename, content, type = 'text/plain') {
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    /**
     * Read file from input
     */
    readFile(file, encoding = 'utf-8') {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsText(file, encoding);
        });
    },

    /**
     * Auto-init from query params
     * Calls callback with params object if any params exist
     */
    autoInit(callback) {
        document.addEventListener('DOMContentLoaded', () => {
            const params = this.getAllParams();
            if (Object.keys(params).length > 0) {
                callback(params);
            }
        });
    }
};

/**
 * Base64 utilities
 */
export const Base64 = {
    encode(str) {
        try {
            return btoa(unescape(encodeURIComponent(str)));
        } catch (e) {
            return btoa(str);
        }
    },
    decode(str) {
        try {
            return decodeURIComponent(escape(atob(str)));
        } catch (e) {
            return atob(str);
        }
    }
};

/**
 * Hash utilities (using Web Crypto API)
 */
export const Hash = {
    async sha256(str) {
        const buf = new TextEncoder().encode(str);
        const hash = await crypto.subtle.digest('SHA-256', buf);
        return Array.from(new Uint8Array(hash))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    },

    async sha512(str) {
        const buf = new TextEncoder().encode(str);
        const hash = await crypto.subtle.digest('SHA-512', buf);
        return Array.from(new Uint8Array(hash))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    },

    async sha1(str) {
        const buf = new TextEncoder().encode(str);
        const hash = await crypto.subtle.digest('SHA-1', buf);
        return Array.from(new Uint8Array(hash))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    },

    md5(str) {
        // Simple MD5 implementation for non-crypto use
        const K = [
            0xd76aa478, 0xe8c7b756, 0x242070db, 0xc1bdceee, 0xf57c0faf, 0x4787c62a,
            0xa8304613, 0xfd469501, 0x698098d8, 0x8b44f7af, 0xffff5bb1, 0x895cd7be,
            0x6b901122, 0xfd987193, 0xa679438e, 0x49b40821, 0xf61e2562, 0xc040b340,
            0x265e5a51, 0xe9b6c7aa, 0xd62f105d, 0x02441453, 0xd8a1e681, 0xe7d3fbc8,
            0x21e1cde6, 0xc33707d6, 0xf4d50d87, 0x455a14ed, 0xa9e3e905, 0xfcefa3f8,
            0x676f02d9, 0x8d2a4c8a, 0xfffa3942, 0x8771f681, 0x6d9d6122, 0xfde5380c,
            0xa4beea44, 0x4bdecfa9, 0xf6bb4b60, 0xbebfbc70, 0x289b7ec6, 0xeaa127fa,
            0xd4ef3085, 0x04881d05, 0xd9d4d039, 0xe6db99e5, 0x1fa27cf8, 0xc4ac5665,
            0xf4292244, 0x432aff97, 0xab9423a7, 0xfc93a039, 0x655b59c3, 0x8f0ccc92,
            0xffeff47d, 0x85845dd1, 0x6fa87e4f, 0xfe2ce6e0, 0xa3014314, 0x4e0811a1,
            0xf7537e82, 0xbd3af235, 0x2ad7d2bb, 0xeb86d391
        ];
        const k = [
            0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
            1, 6, 11, 0, 5, 10, 15, 4, 9, 14, 3, 8, 13, 2, 7, 12,
            5, 8, 11, 14, 1, 4, 7, 10, 13, 0, 3, 6, 9, 12, 15, 2,
            0, 7, 14, 5, 12, 3, 10, 1, 8, 15, 6, 13, 4, 11, 2, 9
        ];
        const s = [
            7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
            5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20,
            4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
            6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21
        ];

        const rotateLeft = (x, c) => (x << c) | (x >>> (32 - c));

        let h0 = 0x67452301;
        let h1 = 0xefcdab89;
        let h2 = 0x98badcfe;
        let h3 = 0x10325476;

        const msg = unescape(encodeURIComponent(str));
        const len = msg.length;
        const padding = (64 - ((len + 8) % 64)) % 64;
        const msgLen = len * 8;

        let bytes = [];
        for (let i = 0; i < len; i++) bytes.push(msg.charCodeAt(i));
        bytes.push(0x80);
        for (let i = 0; i < padding - 8; i++) bytes.push(0);
        for (let i = 0; i < 8; i++) bytes.push((msgLen >>> (i * 8)) & 0xff);

        const w = [];
        for (let i = 0; i < bytes.length; i += 64) {
            for (let j = 0; j < 64; j += 4) {
                w[j / 4] = bytes[i + j] | (bytes[i + j + 1] << 8) |
                          (bytes[i + j + 2] << 16) | (bytes[i + j + 3] << 24);
            }

            let a = h0, b = h1, c = h2, d = h3;

            for (let j = 0; j < 64; j++) {
                let f, g;
                if (j < 16) {
                    f = (b & c) | ((~b) & d);
                    g = j;
                } else if (j < 32) {
                    f = (d & b) | ((~d) & c);
                    g = (5 * j + 1) % 16;
                } else if (j < 48) {
                    f = b ^ c ^ d;
                    g = (3 * j + 5) % 16;
                } else {
                    f = c ^ (b | (~d));
                    g = (7 * j) % 16;
                }

                const temp = d;
                d = c;
                c = b;
                b = b + rotateLeft(a + f + K[j] + w[g], s[j]);
                a = temp;
            }

            h0 += a;
            h1 += b;
            h2 += c;
            h3 += d;
        }

        const toHex = (n) => (n >>> 0).toString(16).padStart(8, '0');
        return toHex(h0) + toHex(h1) + toHex(h2) + toHex(h3);
    }
};

/**
 * TOTP Generator
 */
export const TOTP = {
    async generate(secret, digits = 6, period = 30) {
        const key = this.base32Decode(secret);
        const time = Math.floor(Date.now() / 1000 / period);
        const timeBuffer = new ArrayBuffer(8);
        const view = new DataView(timeBuffer);
        view.setUint32(4, time, false);

        const cryptoKey = await crypto.subtle.importKey(
            'raw', key, { name: 'HMAC', hash: 'SHA-1' }, false, ['sign']
        );
        const signature = await crypto.subtle.sign('HMAC', cryptoKey, timeBuffer);
        const hash = new Uint8Array(signature);

        const offset = hash[hash.length - 1] & 0x0f;
        const code = ((hash[offset] & 0x7f) << 24 |
                      (hash[offset + 1] & 0xff) << 16 |
                      (hash[offset + 2] & 0xff) << 8 |
                      (hash[offset + 3] & 0xff)) % Math.pow(10, digits);

        return code.toString().padStart(digits, '0');
    },

    base32Decode(str) {
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
        let bits = '';
        for (const char of str.toUpperCase().replace(/=+$/, '')) {
            const val = alphabet.indexOf(char);
            if (val === -1) continue;
            bits += val.toString(2).padStart(5, '0');
        }
        const bytes = [];
        for (let i = 0; i + 8 <= bits.length; i += 8) {
            bytes.push(parseInt(bits.slice(i, i + 8), 2));
        }
        return new Uint8Array(bytes);
    },

    generateSecret(length = 32) {
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
        let secret = '';
        const random = crypto.getRandomValues(new Uint8Array(length));
        for (let i = 0; i < length; i++) {
            secret += alphabet[random[i] % 32];
        }
        return secret;
    }
};

/**
 * UUID Generator
 */
export const UUID = {
    v4() {
        const bytes = crypto.getRandomValues(new Uint8Array(16));
        bytes[6] = (bytes[6] & 0x0f) | 0x40;
        bytes[8] = (bytes[8] & 0x3f) | 0x80;

        const hex = Array.from(bytes, b => b.toString(16).padStart(2, '0'));
        return `${hex[0]}${hex[1]}${hex[2]}${hex[3]}-${hex[4]}${hex[5]}-${hex[6]}${hex[7]}-${hex[8]}${hex[9]}-${hex[10]}${hex[11]}${hex[12]}${hex[13]}${hex[14]}${hex[15]}`;
    },

    v1() {
        // Simplified v1-like UUID
        const now = Date.now();
        const timeHex = now.toString(16).padStart(12, '0');
        const random = crypto.getRandomValues(new Uint8Array(10));
        const randHex = Array.from(random, b => b.toString(16).padStart(2, '0'));
        return `${timeHex.slice(0, 8)}-${timeHex.slice(8, 12)}-1${randHex[0][0]}-${randHex[1]}${randHex[2]}-${randHex[3]}${randHex[4]}${randHex[5]}${randHex[6]}${randHex[7]}${randHex[8]}${randHex[9]}`;
    },

    short() {
        return UUID.v4().replace(/-/g, '').slice(0, 22);
    }
};

/**
 * Password Generator
 */
export const Password = {
    generate(length = 16, options = {}) {
        const {
            uppercase = true,
            lowercase = true,
            numbers = true,
            symbols = true
        } = options;

        let chars = '';
        if (uppercase) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        if (lowercase) chars += 'abcdefghijklmnopqrstuvwxyz';
        if (numbers) chars += '0123456789';
        if (symbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';

        if (!chars) chars = 'abcdefghijklmnopqrstuvwxyz';

        const bytes = crypto.getRandomValues(new Uint32Array(length));
        return Array.from(bytes, b => chars[b % chars.length]).join('');
    },

    strength(password) {
        let score = 0;
        if (password.length >= 8) score++;
        if (password.length >= 12) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[a-z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;

        const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
        return { score, label: labels[score], max: 6 };
    }
};

/**
 * Color utilities
 */
export const Color = {
    hexToRgb(hex) {
        const clean = hex.replace('#', '');
        const num = parseInt(clean, 16);
        return {
            r: (num >> 16) & 255,
            g: (num >> 8) & 255,
            b: num & 255
        };
    },

    rgbToHex(r, g, b) {
        return '#' + [r, g, b]
            .map(v => Math.max(0, Math.min(255, v)).toString(16).padStart(2, '0'))
            .join('');
    },

    rgbToHsl(r, g, b) {
        r /= 255; g /= 255; b /= 255;
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }

        return {
            h: Math.round(h * 360),
            s: Math.round(s * 100),
            l: Math.round(l * 100)
        };
    },

    hslToRgb(h, s, l) {
        h /= 360; s /= 100; l /= 100;
        let r, g, b;

        if (s === 0) {
            r = g = b = l;
        } else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1/6) return p + (q - p) * 6 * t;
                if (t < 1/2) return q;
                if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            };
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }

        return {
            r: Math.round(r * 255),
            g: Math.round(g * 255),
            b: Math.round(b * 255)
        };
    },

    hexToHsl(hex) {
        const rgb = this.hexToRgb(hex);
        return this.rgbToHsl(rgb.r, rgb.g, rgb.b);
    },

    hslToHex(h, s, l) {
        const rgb = this.hslToRgb(h, s, l);
        return this.rgbToHex(rgb.r, rgb.g, rgb.b);
    }
};

/**
 * JSON utilities
 */
export const JSONUtil = {
    format(str) {
        try {
            const obj = JSON.parse(str);
            return JSON.stringify(obj, null, 2);
        } catch (e) {
            throw new Error('Invalid JSON: ' + e.message);
        }
    },

    minify(str) {
        try {
            const obj = JSON.parse(str);
            return JSON.stringify(obj);
        } catch (e) {
            throw new Error('Invalid JSON: ' + e.message);
        }
    },

    validate(str) {
        try {
            JSON.parse(str);
            return { valid: true };
        } catch (e) {
            return { valid: false, error: e.message };
        }
    },

    toYaml(obj) {
        const convert = (value, indent = 0) => {
            const spaces = '  '.repeat(indent);
            if (value === null) return 'null';
            if (typeof value === 'boolean') return value.toString();
            if (typeof value === 'number') return value.toString();
            if (typeof value === 'string') {
                if (value.includes('\n') || value.includes(':') || value.includes('#')) {
                    return `|${value.includes('\n') ? '\n' : ''}${value.split('\n').map(l => spaces + '  ' + l).join('\n')}`;
                }
                return value;
            }
            if (Array.isArray(value)) {
                return value.map(v => `${spaces}- ${convert(v, indent + 1)}`).join('\n');
            }
            if (typeof value === 'object') {
                return Object.entries(value)
                    .map(([k, v]) => {
                        const val = convert(v, indent + 1);
                        if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
                            return `${spaces}${k}:\n${val}`;
                        }
                        return `${spaces}${k}: ${val}`;
                    })
                    .join('\n');
            }
            return '';
        };
        return convert(obj);
    }
};

/**
 * CSV utilities
 */
export const CSV = {
    parse(str, delimiter = ',') {
        const lines = str.trim().split('\n');
        const headers = lines[0].split(delimiter).map(h => h.trim().replace(/^"|"$/g, ''));
        return lines.slice(1).map(line => {
            const values = [];
            let current = '';
            let inQuotes = false;
            for (const char of line) {
                if (char === '"') {
                    inQuotes = !inQuotes;
                } else if (char === delimiter && !inQuotes) {
                    values.push(current.trim());
                    current = '';
                } else {
                    current += char;
                }
            }
            values.push(current.trim());

            const obj = {};
            headers.forEach((h, i) => obj[h] = values[i]?.replace(/^"|"$/g, '') || '');
            return obj;
        });
    },

    stringify(data, delimiter = ',') {
        if (!data.length) return '';
        const headers = Object.keys(data[0]);
        const escape = (val) => {
            const str = String(val ?? '');
            if (str.includes(delimiter) || str.includes('"') || str.includes('\n')) {
                return `"${str.replace(/"/g, '""')}"`;
            }
            return str;
        };
        const lines = [
            headers.join(delimiter),
            ...data.map(row => headers.map(h => escape(row[h])).join(delimiter))
        ];
        return lines.join('\n');
    },

    toJSON(csv) {
        return JSON.stringify(this.parse(csv), null, 2);
    },

    fromJSON(json) {
        const data = typeof json === 'string' ? JSON.parse(json) : json;
        return this.stringify(data);
    }
};

/**
 * Lorem Ipsum generator
 */
export const Lorem = {
    words: ['lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
            'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
            'magna', 'aliqua', 'ut', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
            'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo',
            'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate', 'velit',
            'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint', 'occaecat',
            'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia', 'deserunt',
            'mollit', 'anim', 'id', 'est', 'laborum'],

    sentence() {
        const length = Math.floor(Math.random() * 10) + 5;
        const words = [];
        for (let i = 0; i < length; i++) {
            words.push(this.words[Math.floor(Math.random() * this.words.length)]);
        }
        return words.join(' ').charAt(0).toUpperCase() + words.join(' ').slice(1) + '.';
    },

    paragraph() {
        const length = Math.floor(Math.random() * 3) + 3;
        return Array.from({ length }, () => this.sentence()).join(' ');
    },

    generate(paragraphs = 3) {
        return Array.from({ length: paragraphs }, () => this.paragraph()).join('\n\n');
    },

    words(count = 50) {
        const result = [];
        for (let i = 0; i < count; i++) {
            result.push(this.words[Math.floor(Math.random() * this.words.length)]);
        }
        return result.join(' ');
    }
};

/**
 * Text case converter
 */
export const Case = {
    camel(str) {
        return str.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase());
    },

    pascal(str) {
        return str.replace(/\w+/g, w => w[0].toUpperCase() + w.slice(1).toLowerCase())
                  .replace(/\s+/g, '');
    },

    snake(str) {
        return str.replace(/\s+/g, '_').toLowerCase();
    },

    kebab(str) {
        return str.replace(/\s+/g, '-').toLowerCase();
    },

    constant(str) {
        return str.replace(/\s+/g, '_').toUpperCase();
    },

    title(str) {
        return str.replace(/\w\S*/g, w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
    },

    slug(str) {
        return str.toLowerCase()
                  .replace(/[^a-z0-9]+/g, '-')
                  .replace(/^-+|-+$/g, '');
    }
};

/**
 * Timestamp/Date utilities
 */
export const Timestamp = {
    toUnix(date = new Date()) {
        return Math.floor(date.getTime() / 1000);
    },

    fromUnix(timestamp) {
        return new Date(timestamp * 1000);
    },

    format(date, format = 'iso') {
        if (typeof date === 'number') date = this.fromUnix(date);
        if (format === 'iso') return date.toISOString();
        if (format === 'locale') return date.toLocaleString();
        if (format === 'date') return date.toDateString();
        if (format === 'time') return date.toTimeString();
        return date.toString();
    },

    now() {
        return this.toUnix();
    }
};

/**
 * Number base converter
 */
export const Base = {
    convert(num, from, to) {
        const decimal = parseInt(num, from);
        if (isNaN(decimal)) throw new Error('Invalid number');
        return decimal.toString(to);
    },

    binToHex(bin) { return this.convert(bin, 2, 16); },
    binToDec(bin) { return this.convert(bin, 2, 10); },
    binToOct(bin) { return this.convert(bin, 2, 8); },

    hexToBin(hex) { return this.convert(hex, 16, 2); },
    hexToDec(hex) { return this.convert(hex, 16, 10); },
    hexToOct(hex) { return this.convert(hex, 16, 8); },

    decToBin(dec) { return this.convert(dec, 10, 2); },
    decToHex(dec) { return this.convert(dec, 10, 16); },
    decToOct(dec) { return this.convert(dec, 10, 8); }
};

/**
 * URL utilities
 */
export const URLUtil = {
    encode(str) { return encodeURIComponent(str); },
    decode(str) { return decodeURIComponent(str); },
    encodeFull(str) { return encodeURI(str); },
    decodeFull(str) { return decodeURI(str); },

    parse(url) {
        const u = new URL(url);
        return {
            protocol: u.protocol,
            hostname: u.hostname,
            port: u.port,
            pathname: u.pathname,
            search: u.search,
            hash: u.hash,
            params: Object.fromEntries(u.searchParams)
        };
    },

    build(parts) {
        const url = new URL(parts.pathname || '/', parts.protocol + '//' + parts.hostname);
        if (parts.port) url.port = parts.port;
        if (parts.search) url.search = parts.search;
        if (parts.hash) url.hash = parts.hash;
        return url.toString();
    }
};

/**
 * HTML Entity utilities
 */
export const HTMLEntities = {
    encode(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    decode(str) {
        const div = document.createElement('div');
        div.innerHTML = str;
        return div.textContent;
    },

    named: {
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;',
        "'": '&#39;', '/': '&#x2F;', '`': '&#x60;', '=': '&#x3D;'
    }
};

/**
 * Text statistics
 */
export const TextStats = {
    count(str) {
        const chars = str.length;
        const charsNoSpaces = str.replace(/\s/g, '').length;
        const words = str.trim().split(/\s+/).filter(w => w).length;
        const lines = str.split('\n').length;
        const sentences = str.split(/[.!?]+/).filter(s => s.trim()).length;
        const paragraphs = str.split('\n\n').filter(p => p.trim()).length;

        return { chars, charsNoSpaces, words, lines, sentences, paragraphs };
    }
};

// Default export
export default API;
