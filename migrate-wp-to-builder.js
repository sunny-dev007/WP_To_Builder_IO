const axios = require('axios');
const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');
const cliProgress = require('cli-progress');

// Simple console colors
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  underscore: "\x1b[4m",
  blink: "\x1b[5m",
  reverse: "\x1b[7m",
  hidden: "\x1b[8m",
  
  black: "\x1b[30m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  
  bgBlack: "\x1b[40m",
  bgRed: "\x1b[41m",
  bgGreen: "\x1b[42m",
  bgYellow: "\x1b[43m",
  bgBlue: "\x1b[44m",
  bgMagenta: "\x1b[45m",
  bgCyan: "\x1b[46m",
  bgWhite: "\x1b[47m"
};

// Color text helper
function colorText(text, color) {
  return `${color}${text}${colors.reset}`;
}

// Simple spinner implementation
const spinner = {
    frames: ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'],
    interval: null,
    currentFrame: 0,
    text: '',
    active: false,
    
    start(text) {
        this.text = text;
        this.active = true;
        if (this.interval) clearInterval(this.interval);
        
        process.stdout.write('\r');
        this.interval = setInterval(() => {
            process.stdout.write(`\r${colorText(this.frames[this.currentFrame], colors.cyan)} ${this.text}`);
            this.currentFrame = (this.currentFrame + 1) % this.frames.length;
        }, 80);
        
        return this;
    },
    
    stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
        process.stdout.write('\r                                                            \r');
        this.active = false;
        return this;
    },
    
    succeed(text) {
        this.stop();
        console.log(`${colorText('✓', colors.green)} ${text || this.text}`);
        return this;
    },
    
    fail(text) {
        this.stop();
        console.log(`${colorText('✗', colors.red)} ${text || this.text}`);
        return this;
    },
    
    info(text) {
        this.stop();
        console.log(`${colorText('ℹ', colors.blue)} ${text || this.text}`);
        return this;
    }
};

// Simple box implementation
function createBox(text, options = {}) {
    const { 
        padding = 1, 
        margin = 1, 
        borderColor = colors.cyan, 
        borderStyle = 'single' 
    } = options;
    
    const borders = {
        single: {
            topLeft: '┌', topRight: '┐', bottomLeft: '└', bottomRight: '┘',
            horizontal: '─', vertical: '│'
        },
        double: {
            topLeft: '╔', topRight: '╗', bottomLeft: '╚', bottomRight: '╝',
            horizontal: '═', vertical: '║'
        },
        round: {
            topLeft: '╭', topRight: '╮', bottomLeft: '╰', bottomRight: '╯',
            horizontal: '─', vertical: '│'
        }
    };
    
    const border = borders[borderStyle] || borders.single;
    
    // Split text into lines
    const lines = text.split('\n');
    const contentWidth = Math.max(...lines.map(line => {
        // Strip ANSI color codes for width calculation
        return line.replace(/\x1b\[[0-9;]*m/g, '').length;
    }));
    
    // Create top border
    const horizontalBorder = border.horizontal.repeat(contentWidth + padding * 2);
    const top = colorText(`${border.topLeft}${horizontalBorder}${border.topRight}`, borderColor);
    const bottom = colorText(`${border.bottomLeft}${horizontalBorder}${border.bottomRight}`, borderColor);
    
    // Create content lines with padding
    const paddedContent = lines.map(line => {
        // Strip ANSI color codes for width calculation
        const strippedLine = line.replace(/\x1b\[[0-9;]*m/g, '');
        const padLength = contentWidth - strippedLine.length;
        return colorText(border.vertical, borderColor) + ' '.repeat(padding) + 
               line + ' '.repeat(padLength + padding) + 
               colorText(border.vertical, borderColor);
    }).join('\n');
    
    // Add margin
    const verticalMargin = '\n'.repeat(margin);
    const marginLeft = ' '.repeat(margin);
    
    const boxedContent = [
        verticalMargin + marginLeft + top,
        paddedContent.split('\n').map(line => marginLeft + line).join('\n'),
        marginLeft + bottom + verticalMargin
    ].join('\n');
    
    return boxedContent;
}

// ==== CONSOLE STYLING UTILITIES ====
const multiBar = new cliProgress.MultiBar({
    clearOnComplete: false,
    hideCursor: true,
    format: ' {bar} | {percentage}% | {value}/{total} | {title}'
}, cliProgress.Presets.shades_classic);

const consoleStyles = {
    success: colorText('✓', colors.green),
    error: colorText('✗', colors.red),
    warning: colorText('⚠', colors.yellow),
    info: colorText('ℹ', colors.blue),
    title: (text) => colorText(text, colors.bright + colors.cyan),
    subtitle: (text) => colorText(text, colors.bright + colors.magenta),
    highlight: (text) => colorText(text, colors.yellow),
    url: (text) => colorText(text, colors.underscore + colors.blue),
    count: (num) => colorText(num.toString(), colors.bright + colors.green),
    section: (text) => {
        console.log('\n' + createBox(colorText(text, colors.bright + colors.cyan), {
            padding: 1,
            margin: 1,
            borderStyle: 'round',
            borderColor: colors.cyan
        }));
    },
    progressSection: (text) => {
        console.log('\n' + colorText('→ ' + text, colors.bright + colors.magenta));
    }
};

// ==== CONFIGURATION ====
const WORDPRESS_API = 'http://localhost/builder_io/wp-json/wp/v2/pages?per_page=100&_embed=true';
const WORDPRESS_API_USERS = 'http://localhost/builder_io/wp-json/wp/v2/users';
const BUILDER_WRITE_API_KEY = '<BUILDER_WRITE_API_KEY>'; // Replace with your actual Builder.io private API key
const BUILDER_MODEL = 'page'; // default Builder model for web pages
const DEBUG = true; // Set to true to enable debugging output

// Output directory for migration logs and data
const OUTPUT_DIR = './migration-output';

// ==== INSTALL DEPENDENCIES ====
async function ensureDependencies() {
    try {
        spinner.start('Checking dependencies...');
        
        // Check for required styling packages
        const requiredDeps = ['cheerio', 'cli-progress'];
        const missingDeps = [];
        
        for (const dep of requiredDeps) {
            try {
                require(dep);
            } catch (error) {
                missingDeps.push(dep);
            }
        }
        
        if (missingDeps.length > 0) {
            spinner.text = `Installing missing dependencies: ${missingDeps.join(', ')}`;
            execSync(`npm install ${missingDeps.join(' ')} --save`, { stdio: 'inherit' });
            spinner.succeed('Dependencies installed successfully');
        } else {
            spinner.succeed('All dependencies are installed');
        }
        
        return true;
    } catch (installError) {
        spinner.fail(`Failed to install dependencies: ${installError.message}`);
        return false;
    }
}

// ==== FETCH PAGES FROM WORDPRESS ====
async function fetchWordPressPages() {
    try {
        spinner.start('Fetching pages from WordPress API...');
        const response = await axios.get(WORDPRESS_API);
        
        if (DEBUG) {
            fs.writeFileSync(path.join(OUTPUT_DIR, 'wp-pages-raw.json'), JSON.stringify(response.data, null, 2));
            spinner.info('Raw WordPress response saved to wp-pages-raw.json');
        }
        
        if (!Array.isArray(response.data) || response.data.length === 0) {
            spinner.fail('WordPress API returned empty or invalid data');
            return [];
        }
        
        spinner.succeed(`Successfully fetched ${consoleStyles.count(response.data.length)} pages from WordPress`);
        return response.data;
    } catch (error) {
        spinner.fail('Error fetching from WordPress');
        console.error(consoleStyles.error, 'Details:', error.message);
        if (error.response) {
            console.error(consoleStyles.error, 'Response status:', error.response.status);
            console.error(consoleStyles.error, 'Response data:', error.response.data);
        }
        return [];
    }
}

// ==== FETCH POSTS FROM WORDPRESS ====
async function fetchWordPressPosts() {
    try {
        spinner.start('Fetching posts from WordPress API...');
        const response = await axios.get('http://localhost/builder_io/wp-json/wp/v2/posts?per_page=100&_embed=true');
        
        if (DEBUG) {
            fs.writeFileSync(path.join(OUTPUT_DIR, 'wp-posts-raw.json'), JSON.stringify(response.data, null, 2));
            spinner.info('Raw WordPress posts response saved to wp-posts-raw.json');
        }
        
        if (!Array.isArray(response.data) || response.data.length === 0) {
            spinner.fail('WordPress API returned empty or invalid data for posts');
            return [];
        }
        
        spinner.succeed(`Successfully fetched ${consoleStyles.count(response.data.length)} posts from WordPress`);
        return response.data;
    } catch (error) {
        spinner.fail('Error fetching posts from WordPress');
        if (error.response) {
            console.error(consoleStyles.error, 'Response status:', error.response.status);
            console.error(consoleStyles.error, 'Response data:', error.response.data);
        } else {
            console.error(consoleStyles.error, 'Error:', error.message);
        }
        return [];
    }
}

// ==== FETCH USERS FROM WORDPRESS ====
async function fetchWordPressUsers() {
    try {
        spinner.start(`Fetching users from WordPress API...`);
        const response = await axios.get(WORDPRESS_API_USERS);
        
        if (DEBUG) {
            fs.writeFileSync(path.join(OUTPUT_DIR, 'wp-users-raw.json'), JSON.stringify(response.data, null, 2));
            spinner.info('Raw WordPress users response saved to wp-users-raw.json');
        }
        
        if (!Array.isArray(response.data) || response.data.length === 0) {
            spinner.fail('WordPress API returned empty or invalid data for users');
            return [];
        }
        
        spinner.succeed(`Successfully fetched ${consoleStyles.count(response.data.length)} users from WordPress`);
        return response.data;
    } catch (error) {
        spinner.fail('Error fetching users from WordPress');
        if (error.response) {
            console.error(consoleStyles.error, 'Response status:', error.response.status);
            console.error(consoleStyles.error, 'Response data:', error.response.data);
        } else {
            console.error(consoleStyles.error, 'Error:', error.message);
        }
        return [];
    }
}

// ==== FETCH SEO DATA FROM WORDPRESS (Using Yoast SEO Plugin API) ====
async function fetchWordPressSeoData(contentId, contentType = 'page') {
    try {
        spinner.start(`Fetching SEO data for ${contentType} ${contentId}...`);
        // This endpoint is specific to Yoast SEO plugin
        const response = await axios.get(`http://localhost/builder_io/wp-json/yoast/v1/${contentType}s/${contentId}`);
        spinner.succeed(`SEO data fetched for ${contentType} ${contentId}`);
        return response.data;
    } catch (error) {
        spinner.fail(`Could not fetch SEO data for ${contentType} ${contentId}: ${error.message}`);
        return null;
    }
}

// ==== EXTRACT MEDIA FROM CONTENT ====
function extractMedia(content) {
  const cheerio = require('cheerio');
  const $ = cheerio.load(content);
  const media = {
    images: [],
    videos: [],
    audio: []
  };
  
  // Extract images
  $('img').each((i, el) => {
    const src = $(el).attr('src');
    if (src) {
      media.images.push({
        src,
        alt: $(el).attr('alt') || '',
        title: $(el).attr('title') || ''
      });
    }
  });
  
  // Extract videos
  $('video, iframe[src*="youtube"], iframe[src*="vimeo"]').each((i, el) => {
    const isIframe = el.tagName.toLowerCase() === 'iframe';
    media.videos.push({
      src: isIframe ? $(el).attr('src') : $(el).find('source').attr('src'),
      type: isIframe ? 'embed' : 'video',
      width: $(el).attr('width') || '',
      height: $(el).attr('height') || ''
    });
  });
  
  // Extract audio
  $('audio').each((i, el) => {
    media.audio.push({
      src: $(el).find('source').attr('src'),
      type: $(el).find('source').attr('type') || ''
    });
  });
  
  return media;
}

// ==== TRANSFORM TO BUILDER.IO FORMAT ====
async function transformToBuilderPage(wpPage) {
  const cheerio = require('cheerio');
  
  // Extract the content from WordPress
  const wpContent = wpPage.content.rendered || '';
  
  // Log content length for debugging
  console.log(`Processing page "${wpPage.title.rendered}" with content length: ${wpContent.length} chars`);
  
  if (DEBUG) {
    // Save a sample of the content for debugging (first 500 chars)
    console.log(`Content sample: ${wpContent.substring(0, 500)}...`);
  }
  
  // Extract media from content for reporting
  const mediaAssets = extractMedia(wpContent);
  if (DEBUG) {
    fs.writeFileSync(
      path.join(OUTPUT_DIR, `page-${wpPage.id}-media.json`), 
      JSON.stringify(mediaAssets, null, 2)
    );
  }
  
  // Load the HTML content with Cheerio
  const $ = cheerio.load(wpContent);
  
  // Add a section to contain all content
  const mainSection = {
    "@type": "@builder.io/sdk:Element",
    "@version": 2,
    "id": "builder-main-section-" + Date.now(),
    "component": {
      "name": "Core:Section",
      "options": {
        "maxWidth": 1200,
        "marginTop": 0,
        "marginBottom": 0,
        "padding": 20,
        "backgroundColor": "#ffffff"
      }
    },
    "children": [],
    "responsiveStyles": {
      "large": {
        "display": "flex",
        "flexDirection": "column",
        "position": "relative",
        "flexShrink": "0",
        "boxSizing": "border-box",
        "marginTop": "0",
        "width": "100%"
      }
    }
  };
  
  // Process the HTML structure and add to the section
  $('body > *').each((i, element) => {
    const $el = $(element);
    const tagName = element.tagName.toLowerCase();
    
    if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tagName)) {
      // Add headings
      mainSection.children.push({
        "@type": "@builder.io/sdk:Element",
        "@version": 2,
        "id": `builder-heading-${i}-${Date.now()}`,
        "component": {
          "name": "Text",
          "options": {
            "text": $el.html()
          }
        },
        "responsiveStyles": {
          "large": {
            "display": "flex",
            "flexDirection": "column",
            "position": "relative",
            "flexShrink": "0",
            "boxSizing": "border-box",
            "marginTop": "20px",
            "marginBottom": "10px",
            "paddingLeft": "0px",
            "paddingRight": "0px",
            "fontWeight": tagName === 'h1' ? "600" : 
                         tagName === 'h2' ? "500" : "400",
            "fontSize": tagName === 'h1' ? "36px" : 
                       tagName === 'h2' ? "30px" : 
                       tagName === 'h3' ? "24px" : 
                       tagName === 'h4' ? "20px" : 
                       tagName === 'h5' ? "18px" : "16px"
          }
        }
      });
    } 
    else if (tagName === 'p') {
      // Add paragraphs
      mainSection.children.push({
        "@type": "@builder.io/sdk:Element",
        "@version": 2,
        "id": `builder-paragraph-${i}-${Date.now()}`,
        "component": {
          "name": "Text",
          "options": {
            "text": $el.html()
          }
        },
        "responsiveStyles": {
          "large": {
            "display": "flex",
            "flexDirection": "column",
            "position": "relative",
            "flexShrink": "0",
            "boxSizing": "border-box",
            "marginTop": "0",
            "marginBottom": "15px",
            "paddingLeft": "0px",
            "paddingRight": "0px",
            "fontSize": "16px",
            "lineHeight": "1.5"
          }
        }
      });
    }
    else if (tagName === 'img' || ($el.find('img').length > 0 && $el.find('img').length === 1 && $el.text().trim().length === 0)) {
      // Handle images
      const $img = tagName === 'img' ? $el : $el.find('img').first();
      const src = $img.attr('src');
      const alt = $img.attr('alt') || '';
      
      if (src) {
        mainSection.children.push({
          "@type": "@builder.io/sdk:Element",
          "@version": 2,
          "id": `builder-image-${i}-${Date.now()}`,
          "component": {
            "name": "Image",
            "options": {
              "image": src,
              "altText": alt
            }
          },
          "responsiveStyles": {
            "large": {
              "display": "flex",
              "flexDirection": "column",
              "position": "relative",
              "flexShrink": "0",
              "boxSizing": "border-box",
              "marginTop": "20px",
              "marginBottom": "20px",
              "width": "100%",
              "minHeight": "20px",
              "minWidth": "20px",
              "overflow": "hidden"
            }
          }
        });
      }
    }
    else if (tagName === 'video' || tagName === 'iframe') {
      // Handle videos and embedded content
      const src = $el.attr('src') || $el.find('source').attr('src');
      if (src) {
        if (tagName === 'iframe') {
          // Handle embedded content (YouTube, Vimeo, etc.)
          mainSection.children.push({
            "@type": "@builder.io/sdk:Element",
            "@version": 2,
            "id": `builder-embed-${i}-${Date.now()}`,
            "component": {
              "name": "Embed",
              "options": {
                "url": src,
                "width": $el.attr('width') || '100%',
                "height": $el.attr('height') || '400px'
              }
            },
            "responsiveStyles": {
              "large": {
                "marginTop": "20px",
                "marginBottom": "20px",
                "width": "100%"
              }
            }
          });
        } else {
          // Handle regular videos
          mainSection.children.push({
            "@type": "@builder.io/sdk:Element",
            "@version": 2,
            "id": `builder-video-${i}-${Date.now()}`,
            "component": {
              "name": "Video",
              "options": {
                "video": src,
                "autoPlay": $el.attr('autoplay') ? true : false,
                "controls": $el.attr('controls') ? true : false,
                "muted": $el.attr('muted') ? true : false,
                "loop": $el.attr('loop') ? true : false
              }
            },
            "responsiveStyles": {
              "large": {
                "marginTop": "20px",
                "marginBottom": "20px",
                "width": "100%"
              }
            }
          });
        }
      }
    }
    else if (tagName === 'audio') {
      // Handle audio content
      const src = $el.attr('src') || $el.find('source').attr('src');
      if (src) {
        mainSection.children.push({
          "@type": "@builder.io/sdk:Element",
          "@version": 2,
          "id": `builder-audio-${i}-${Date.now()}`,
          "component": {
            "name": "CustomCode",
            "options": {
              "code": `<audio controls src="${src}" style="width:100%">${$el.html()}</audio>`
            }
          },
          "responsiveStyles": {
            "large": {
              "marginTop": "20px",
              "marginBottom": "20px",
              "width": "100%"
            }
          }
        });
      }
    }
    else if (tagName === 'div') {
      // Handle divs which could be complex content
      const divContent = $el.html();
      
      // If div contains both an image and text, create columns
      if ($el.find('img').length > 0 && $el.text().trim().length > 0) {
        const $img = $el.find('img').first();
        const imgSrc = $img.attr('src');
        
        // Create a columns layout
        const columnsSection = {
          "@type": "@builder.io/sdk:Element",
          "@version": 2,
          "id": `builder-columns-${i}-${Date.now()}`,
          "component": {
            "name": "Columns",
            "options": {
              "columns": [
                {
                  "blocks": [
                    {
                      "@type": "@builder.io/sdk:Element",
                      "component": {
                        "name": "Image",
                        "options": {
                          "image": imgSrc,
                          "altText": $img.attr('alt') || ""
                        }
                      }
                    }
                  ]
                },
                {
                  "blocks": [
                    {
                      "@type": "@builder.io/sdk:Element",
                      "component": {
                        "name": "Text",
                        "options": {
                          "text": divContent
                        }
                      }
                    }
                  ]
                }
              ],
              "space": 20,
              "stackColumnsAt": "tablet"
            }
          },
          "responsiveStyles": {
            "large": {
              "display": "flex",
              "marginTop": "20px",
              "marginBottom": "20px",
              "width": "100%"
            }
          }
        };
        
        mainSection.children.push(columnsSection);
      } else {
        // Just a regular div, add as a container
        mainSection.children.push({
          "@type": "@builder.io/sdk:Element",
          "@version": 2,
          "id": `builder-div-${i}-${Date.now()}`,
          "component": {
            "name": "Text",
            "options": {
              "text": divContent
            }
          },
          "responsiveStyles": {
            "large": {
              "display": "flex",
              "flexDirection": "column",
              "position": "relative",
              "flexShrink": "0",
              "boxSizing": "border-box",
              "marginTop": "10px",
              "marginBottom": "10px"
            }
          }
        });
      }
    }
    else {
      // Default for other elements, wrap in Text component
      mainSection.children.push({
        "@type": "@builder.io/sdk:Element",
        "@version": 2,
        "id": `builder-element-${i}-${Date.now()}`,
        "component": {
          "name": "Text",
          "options": {
            "text": $el.html() || $el.text()
          }
        }
      });
    }
  });
  
  // If we have a featured image from WordPress, add it at the top
  if (wpPage._embedded && 
      wpPage._embedded['wp:featuredmedia'] && 
      wpPage._embedded['wp:featuredmedia'][0] && 
      wpPage._embedded['wp:featuredmedia'][0].source_url) {
    
    const featuredImageSrc = wpPage._embedded['wp:featuredmedia'][0].source_url;
    
    // Insert featured image at the top
    mainSection.children.unshift({
      "@type": "@builder.io/sdk:Element",
      "@version": 2,
      "id": `builder-featured-image-${Date.now()}`,
      "component": {
        "name": "Image",
        "options": {
          "image": featuredImageSrc,
          "altText": wpPage.title.rendered || "Featured image"
        }
      },
      "responsiveStyles": {
        "large": {
          "display": "flex",
          "flexDirection": "column",
          "position": "relative",
          "flexShrink": "0",
          "boxSizing": "border-box",
          "marginTop": "0",
          "marginBottom": "30px",
          "width": "100%",
          "maxHeight": "500px",
          "objectFit": "contain"
        }
      }
    });
  }
  
  // Try to fetch SEO data if available
  let seoData = null;
  try {
    seoData = await fetchWordPressSeoData(wpPage.id);
  } catch (e) {
    console.warn(`Could not fetch SEO data for page ${wpPage.id}`);
  }
  
  // Create the page data for Builder.io
  const pageData = {
    name: wpPage.title.rendered || 'Untitled',
    data: {
      title: wpPage.title.rendered || 'Untitled',
      description: wpPage.excerpt?.rendered || '',
      blocks: [mainSection]
    },
    published: wpPage.status === "publish" ? "published" : "draft",
    // Preserve the original publication date
    lastUpdated: new Date(wpPage.modified).getTime(),
    // Specify when to publish if it's scheduled
    scheduledPublishDate: wpPage.status === "future" ? new Date(wpPage.date).getTime() : undefined,
    url: '/' + (wpPage.slug || 'page'),
    model: BUILDER_MODEL,
    // Add SEO metadata if available
    meta: {
      ...seoData ? {
        title: seoData.title || wpPage.title.rendered,
        description: seoData.description || wpPage.excerpt?.rendered,
        og: {
          title: seoData.open_graph_title || seoData.title || wpPage.title.rendered,
          description: seoData.open_graph_description || seoData.description || wpPage.excerpt?.rendered,
          image: seoData.open_graph_image || (wpPage._embedded?.['wp:featuredmedia']?.[0]?.source_url || '')
        }
      } : {},
      // Add original WordPress data for reference
      originalWordPressId: wpPage.id,
      originalWordPressUrl: wpPage.link,
      author: wpPage.author,
      authorName: wpPage._embedded?.author?.[0]?.name
    }
  };
  
  if (DEBUG) {
    // Save the Builder.io page data to a file for inspection
    const debugFilename = path.join(OUTPUT_DIR, `builder-page-${wpPage.slug || 'page'}.json`);
    fs.writeFileSync(debugFilename, JSON.stringify(pageData, null, 2));
    console.log(`Builder.io page data saved to ${debugFilename}`);
  }
  
  return pageData;
}

// ==== SEND PAGE TO BUILDER.IO ====
async function sendToBuilderIO(pageData) {
  try {
    console.log(`Sending page "${pageData.name}" to Builder.io...`);
    
    const res = await axios.post(
      'https://builder.io/api/v1/write/' + BUILDER_MODEL,
      pageData,
      {
        headers: {
          'Authorization': `Bearer ${BUILDER_WRITE_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log(`✓ Page "${pageData.name}" created at ${pageData.url}`);
    return {
      success: true,
      page: res.data,
      url: pageData.url
    };
  } catch (error) {
    console.error(`✗ Failed to create page "${pageData.name}":`);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
    return {
      success: false,
      error: error.response?.data?.message || error.message
    };
  }
}

// ==== MIGRATION REPORT ====
function generateMigrationReport(results) {
    const report = {
        totalPages: results.length,
        successfulPages: results.filter(r => r.success).length,
        failedPages: results.filter(r => !r.success).length,
        successList: results.filter(r => r.success).map(r => ({
            name: r.page.name,
            url: r.page.url
        })),
        failureList: results.filter(r => !r.success).map(r => ({
            name: r.pageName,
            error: r.error
        }))
    };
    
    const reportPath = path.join(OUTPUT_DIR, 'migration-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\nMigration report saved to ${consoleStyles.url(reportPath)}`);
    
    // Print summary in a beautiful box
    console.log('\n' + createBox(
        colorText('MIGRATION SUMMARY\n\n', colors.bright + colors.white) +
        `Total Pages: ${consoleStyles.count(report.totalPages)}\n` +
        `Successfully Migrated: ${consoleStyles.success} ${consoleStyles.count(report.successfulPages)}\n` +
        `Failed Migrations: ${report.failedPages > 0 ? consoleStyles.error : consoleStyles.success} ${consoleStyles.count(report.failedPages)}`,
        {
            padding: 1,
            margin: 1,
            borderStyle: 'double',
            borderColor: colors.cyan
        }
    ));
    
    // List successful migrations
    if (report.successList.length > 0) {
        console.log('\n' + colorText('Successfully Migrated Pages:', colors.bright + colors.green));
        report.successList.forEach(page => {
            console.log(`${consoleStyles.success} ${page.name} → ${consoleStyles.url(page.url)}`);
        });
    }
    
    // List failed migrations
    if (report.failureList.length > 0) {
        console.log('\n' + colorText('Failed Migrations:', colors.bright + colors.red));
        report.failureList.forEach(page => {
            console.log(`${consoleStyles.error} ${page.name}: ${colorText(page.error, colors.red)}`);
        });
    }
    
    return report;
}

// ==== MAIN FUNCTION ====
async function migrate() {
    console.log(createBox(colorText('WordPress to Builder.io Migration', colors.bright + colors.cyan), {
        padding: 1,
        margin: 1,
        borderStyle: 'double',
        borderColor: colors.cyan
    }));
    
    // First ensure dependencies are installed
    const depsInstalled = await ensureDependencies();
    if (!depsInstalled) {
        console.error(consoleStyles.error, 'Failed to install required dependencies. Exiting.');
        process.exit(1);
        return;
    }
    
    // Create output directory if it doesn't exist
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
        console.log(consoleStyles.success, 'Created output directory:', OUTPUT_DIR);
    }
    
    // Fetch WordPress users for reference
    consoleStyles.section('FETCHING USERS');
    const users = await fetchWordPressUsers();
    console.log(consoleStyles.info, `Found ${consoleStyles.count(users.length)} users in WordPress`);
    //return true;
    // Fetch pages from WordPress
    consoleStyles.section('FETCHING PAGES');
    const pages = await fetchWordPressPages();
    console.log(consoleStyles.info, `Found ${consoleStyles.count(pages.length)} pages in WordPress`);
    
    // For full implementation, we'd also fetch posts
    consoleStyles.section('FETCHING POSTS');
    const posts = await fetchWordPressPosts();
    console.log(consoleStyles.info, `Found ${consoleStyles.count(posts.length)} posts in WordPress`);
    
    if (pages.length === 0) {
        console.error(consoleStyles.error, 'No pages found to migrate. Exiting.');
        return;
    }
    
    // Process each page
    consoleStyles.section('MIGRATING PAGES');
    const migrationResults = [];
    const progressBar = multiBar.create(pages.length, 0, { title: 'Progress' });

    for (const [index, wpPage] of pages.entries()) {
        consoleStyles.progressSection(`Processing: ${wpPage.title.rendered}`);
        progressBar.update(index + 1);
        
        try {
            spinner.start('Transforming page to Builder.io format...');
            const builderPage = await transformToBuilderPage(wpPage);
            spinner.succeed('Page transformed successfully');
            
            spinner.start('Sending to Builder.io...');
            const result = await sendToBuilderIO(builderPage);
            if (result.success) {
                spinner.succeed(`Page "${wpPage.title.rendered}" migrated successfully`);
            } else {
                spinner.fail(`Failed to migrate page "${wpPage.title.rendered}"`);
            }
            
            migrationResults.push({
                ...result,
                pageName: wpPage.title.rendered
            });
        } catch (error) {
            spinner.fail(`Error processing page "${wpPage.title.rendered}"`);
            console.error(consoleStyles.error, 'Details:', error.message);
            migrationResults.push({
                success: false,
                pageName: wpPage.title.rendered,
                error: error.message
            });
        }
    }
    
    multiBar.stop();
    
    // Generate migration report
    consoleStyles.section('GENERATING REPORT');
    const report = generateMigrationReport(migrationResults);
    
    console.log('\n' + colorText('✨ Migration complete! ✨', colors.bright + colors.green));
    return report;
}

migrate();
