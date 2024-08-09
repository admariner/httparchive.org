csp = {
    "default-src": "'self'",
    "style-src": ["'self'", "'unsafe-inline'"],
    "script-src": [
        "'self'",
        "'strict-dynamic'",
        "cdn.httparchive.org",
        "use.fontawesome.com",
        "*.googletagmanager.com",
        "cdn.speedcurve.com",
        "spdcrv.global.ssl.fastly.net",
        "lux.speedcurve.com",
        "'unsafe-inline'",
        "dev-gw-2vzgiib6.ue.gateway.dev",
        "prod-gw-2vzgiib6.ue.gateway.dev",
    ],
    "font-src": ["'self'"],
    "connect-src": [
        "'self'",
        "cdn.httparchive.org",
        "discuss.httparchive.org",
        "dev.to",
        "cdn.rawgit.com",
        "www.webpagetest.org",
        "*.analytics.google.com",
        "*.google-analytics.com",
        "*.googletagmanager.com",
        "*.speedcurve.com",
        "dev-gw-2vzgiib6.ue.gateway.dev",
        "prod-gw-2vzgiib6.ue.gateway.dev",
    ],
    "img-src": [
        "'self'",
        "https:",
        "*.google-analytics.com",
        "*.googletagmanager.com",
    ],
    "frame-src": ["'none'"],
    "object-src": ["'none'"],
    "base-uri": ["'none'"],
}
