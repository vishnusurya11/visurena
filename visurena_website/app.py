import os
import markdown
from flask import Flask, render_template, abort

app = Flask(__name__)

POSTS_DIR = 'posts'

def get_post_list():
    posts = []
    for filename in os.listdir(POSTS_DIR):
        if filename.endswith('.md'):
            # Remove the '.md' extension to get the slug
            slug = filename[:-3]
            posts.append(slug)
    # Sort posts in reverse order (adjust as needed, e.g., if using date prefixes)
    posts.sort(reverse=True)
    return posts

def get_post_content(slug):
    filepath = os.path.join(POSTS_DIR, f'{slug}.md')
    if not os.path.exists(filepath):
        return None
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    html_content = markdown.markdown(content)
    return html_content

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/movies')
def movies():
    return render_template('movies.html')

@app.route('/music')
def music():
    return render_template('music.html')

@app.route('/games')
def games():
    return render_template('games.html')

@app.route('/story')
def story():
    return render_template('story.html')

@app.route('/blog')
def blog():
    posts = get_post_list()
    return render_template('blog.html', posts=posts)

@app.route('/blog/<slug>')
def blog_post(slug):
    content = get_post_content(slug)
    if content is None:
        abort(404)
    return render_template('post.html', content=content, slug=slug)

if __name__ == '__main__':
    app.run(debug=True)
