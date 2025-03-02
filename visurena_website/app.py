import os
import sys
import shutil
import markdown
from flask import Flask, render_template, abort
from flask_frozen import Freezer
from datetime import datetime
import frontmatter

app = Flask(__name__)
freezer = Freezer(app)

POSTS_DIR = 'posts'

def get_posts():
    posts = []
    for filename in os.listdir(POSTS_DIR):
        if filename.endswith('.md'):
            slug = filename[:-3]
            filepath = os.path.join(POSTS_DIR, filename)
            with open(filepath, 'r', encoding='utf-8') as f:
                post = frontmatter.load(f)
            post_data = {
                "slug": slug,
                "title": post.get("title", slug.replace('_', ' ').title()),
                "date": post.get("date", ""),
                "introduction": post.get("introduction", ""),
                "image": post.get("image", ""),
                "content": markdown.markdown(post.content)
            }
            posts.append(post_data)
    # Sort posts by date in reverse order (assuming ISO date format YYYY-MM-DD)
    posts.sort(key=lambda p: p.get("date", ""), reverse=True)
    return posts

def get_post_list():
    posts = []
    for filename in os.listdir(POSTS_DIR):
        if filename.endswith('.md'):
            slug = filename[:-3]
            posts.append(slug)
    posts.sort(reverse=True)
    return posts

def get_post_content(slug):
    filepath = os.path.join(POSTS_DIR, f'{slug}.md')
    if not os.path.exists(filepath):
        return None
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    return markdown.markdown(content)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/movies/')
def movies():
    return render_template('movies.html')

@app.route('/music/')
def music():
    return render_template('music.html')

@app.route('/games/')
def games():
    return render_template('games.html')

@app.route('/story/')
def story():
    return render_template('story.html')

# Blog routes with trailing slashes
@app.route('/blog/')
def blog():
    posts = get_posts()
    return render_template('blog.html', posts=posts)

@app.route('/blog/<slug>/')
def blog_post(slug):
    filepath = os.path.join(POSTS_DIR, f'{slug}.md')
    if not os.path.exists(filepath):
        abort(404)
    with open(filepath, 'r', encoding='utf-8') as f:
        post = frontmatter.load(f)
    post_data = {
        "title": post.get("title", slug.replace('_', ' ').title()),
        "date": post.get("date", ""),
        "introduction": post.get("introduction", ""),
        "image": post.get("image", ""),
        "content": markdown.markdown(post.content)
    }
    return render_template('post.html', content=post_data['content'], metadata=post_data, slug=slug)

if __name__ == '__main__':
    if len(sys.argv) > 1 and sys.argv[1] == 'freeze':
        # Remove the build directory if it exists
        build_dir = os.path.join(os.path.dirname(__file__), 'build')
        if os.path.exists(build_dir):
            print(f"Removing existing build directory: {build_dir}")
            shutil.rmtree(build_dir)
        print("Starting freeze process...")
        freezer.freeze()  # Generates static files into the 'build' directory
        print("Freeze process completed.")
    else:
        app.run(debug=True)
