/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://translate.io.vn',
  generateRobotsTxt: true,
  sitemapSize: 7000,
  changefreq: 'weekly',
  priority: 0.7,
  robotsTxtOptions: {
    additionalSitemaps: [
      'https://translate.io.vn/server-sitemap.xml', // Optional: Nếu bạn có sitemap động
    ],
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/*', '/_next/*', '/admin/*']
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
      }
    ],
  },
  exclude: ['/404', '/500', '/api/*', '/admin/*'],
  transform: async (config, path) => {
    // Tùy chỉnh priority dựa trên đường dẫn
    let priority = config.priority;
    
    // Trang chủ có độ ưu tiên cao nhất
    if (path === '/') {
      priority = 1.0;
    } 
    // Trang /guide có độ ưu tiên cao
    else if (path === '/guide') {
      priority = 0.9;
    }
    
    return {
      loc: path,
      changefreq: config.changefreq,
      priority,
      lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
      alternateRefs: config.alternateRefs ?? [],
    };
  },
}; 