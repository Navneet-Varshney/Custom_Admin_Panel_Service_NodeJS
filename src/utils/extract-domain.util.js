const { URL } = require("url");

const extractDomain = (value = "") => {
    if (!value || typeof value !== "string") return null;

    const trimmed = value.trim().toLowerCase();
    if (!trimmed) return null;

    if (trimmed.includes("@")) {
        const parts = trimmed.split("@");
        return parts[1] || null;
    }

    try {
        const normalized = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
        const parsed = new URL(normalized);
        return parsed.hostname ? parsed.hostname.toLowerCase() : null;
    } catch (error) {
        return null;
    }
};

module.exports = {
    extractDomain
};
