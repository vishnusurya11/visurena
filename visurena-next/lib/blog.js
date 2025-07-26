import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const postsDirectory = path.join(process.cwd(), 'posts');

export function getAllPosts() {
  try {
    // Check if posts directory exists
    if (!fs.existsSync(postsDirectory)) {
      return [];
    }

    const fileNames = fs.readdirSync(postsDirectory);
    const allPostsData = fileNames
      .filter(fileName => fileName.endsWith('.html') || fileName.endsWith('.md'))
      .map(fileName => {
        const slug = fileName.replace(/\.(html|md)$/, '');
        const fullPath = path.join(postsDirectory, fileName);
        const fileContents = fs.readFileSync(fullPath, 'utf8');
        
        let postData, content;
        
        if (fileName.endsWith('.html')) {
          // For HTML files, extract metadata from HTML comments or use filename
          const titleMatch = fileContents.match(/<title>(.*?)<\/title>/i);
          const metaTitle = fileContents.match(/<meta\s+name="title"\s+content="(.*?)"/i);
          const metaDescription = fileContents.match(/<meta\s+name="description"\s+content="(.*?)"/i);
          const metaDate = fileContents.match(/<meta\s+name="date"\s+content="(.*?)"/i);
          const metaImage = fileContents.match(/<meta\s+name="image"\s+content="(.*?)"/i);
          const metaTags = fileContents.match(/<meta\s+name="tags"\s+content="(.*?)"/i);
          
          postData = {
            title: (metaTitle && metaTitle[1]) || (titleMatch && titleMatch[1]) || slug.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            introduction: (metaDescription && metaDescription[1]) || 'Blog post',
            image: (metaImage && metaImage[1]) || '/images/blog-default.jpg',
            date: (metaDate && metaDate[1]) || '2025-01-01',
            tags: (metaTags && metaTags[1].split(',').map(t => t.trim())) || [],
            author: 'ViSuReNa',
            isHtml: true
          };
          content = fileContents;
        } else {
          // For markdown files (backward compatibility)
          const matterResult = matter(fileContents);
          postData = { ...matterResult.data, isHtml: false };
          content = matterResult.content;
        }

        return {
          id: slug,
          slug,
          type: 'blog',
          title: postData.title || slug.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          description: postData.introduction || 'Blog post',
          thumbnail: postData.image || '/images/blog-default.jpg',
          readUrl: `/blog/${slug}`,
          content: content,
          duration: `${Math.ceil(content.replace(/<[^>]*>/g, '').split(' ').length / 200)} min read`,
          releaseDate: postData.date || '2025-01-01',
          tags: postData.tags || [],
          rating: 5.0,
          featured: postData.featured || false,
          author: postData.author || 'ViSuReNa',
          category: postData.category || 'General',
          isHtml: fileName.endsWith('.html'),
          ...postData
        };
      })
      .sort((a, b) => (new Date(b.releaseDate) - new Date(a.releaseDate)));

    return allPostsData;
  } catch (error) {
    console.error('Error reading blog posts:', error);
    return [];
  }
}

export function getPostBySlug(slug) {
  try {
    // Try HTML first, then markdown
    let fullPath = path.join(postsDirectory, `${slug}.html`);
    let isHtml = true;
    
    if (!fs.existsSync(fullPath)) {
      fullPath = path.join(postsDirectory, `${slug}.md`);
      isHtml = false;
      
      if (!fs.existsSync(fullPath)) {
        return null;
      }
    }

    const fileContents = fs.readFileSync(fullPath, 'utf8');
    
    if (isHtml) {
      // Extract metadata from HTML
      const titleMatch = fileContents.match(/<title>(.*?)<\/title>/i);
      const metaTitle = fileContents.match(/<meta\s+name="title"\s+content="(.*?)"/i);
      const metaDescription = fileContents.match(/<meta\s+name="description"\s+content="(.*?)"/i);
      const metaDate = fileContents.match(/<meta\s+name="date"\s+content="(.*?)"/i);
      const metaImage = fileContents.match(/<meta\s+name="image"\s+content="(.*?)"/i);
      const metaTags = fileContents.match(/<meta\s+name="tags"\s+content="(.*?)"/i);
      
      return {
        slug,
        content: fileContents,
        title: (metaTitle && metaTitle[1]) || (titleMatch && titleMatch[1]) || slug.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        introduction: (metaDescription && metaDescription[1]) || 'Blog post',
        image: (metaImage && metaImage[1]) || '/images/blog-default.jpg',
        date: (metaDate && metaDate[1]) || new Date().toISOString().split('T')[0],
        tags: (metaTags && metaTags[1].split(',').map(t => t.trim())) || [],
        author: 'ViSuReNa',
        isHtml: true
      };
    } else {
      // Handle markdown files
      const matterResult = matter(fileContents);
      return {
        slug,
        content: matterResult.content,
        title: matterResult.data.title || slug.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        isHtml: false,
        ...matterResult.data
      };
    }
  } catch (error) {
    console.error('Error reading post:', error);
    return null;
  }
}