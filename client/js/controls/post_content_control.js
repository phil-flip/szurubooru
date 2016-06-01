'use strict';

const settings = require('../settings.js');
const views = require('../util/views.js');
const optimizedResize = require('../util/optimized_resize.js');

class PostContentControl {
    constructor(containerNode, post, viewportSizeCalculator) {
        post.canvasWidth = post.canvasWidth || 800;
        post.canvasHeight = post.canvasHeight || 450;

        this._post = post;
        this._viewportSizeCalculator = viewportSizeCalculator;
        this._containerNode = containerNode;
        this._template = views.getTemplate('post-content');

        this._install();

        this._currentFitFunction = this.fitBoth;
        this._currentFitFunction();
    }

    fitWidth() {
        this._currentFitFunction = this.fitWidth;
        const mul = this._post.canvasHeight / this._post.canvasWidth;
        let width = this._viewportWidth;
        if (!settings.getSettings().upscaleSmallPosts) {
            width = Math.min(this._post.canvasWidth, width);
        }
        this._resize(width, width * mul);
    }

    fitHeight() {
        this._currentFitFunction = this.fitHeight;
        const mul = this._post.canvasWidth / this._post.canvasHeight;
        let height = this._viewportHeight;
        if (!settings.getSettings().upscaleSmallPosts) {
            height = Math.min(this._post.canvasHeight, height);
        }
        this._resize(height * mul, height);
    }

    fitBoth() {
        this._currentFitFunction = this.fitBoth;
        let mul = this._post.canvasHeight / this._post.canvasWidth;
        if (this._viewportWidth * mul < this._viewportHeight) {
            this.fitWidth();
        } else {
            this.fitHeight();
        }
    }

    get _viewportWidth() {
        return this._viewportSizeCalculator()[0];
    }

    get _viewportHeight() {
        return this._viewportSizeCalculator()[1];
    }

    _resize(width, height) {
        const postContentNode =
            this._containerNode.querySelector('.post-content');
        postContentNode.style.width = width + 'px';
        postContentNode.style.height = height + 'px';
    }

    _refreshSize() {
        this._currentFitFunction();
    }

    _install() {
        const postContentNode = this._template({
            post: this._post,
        });
        this._containerNode.appendChild(postContentNode);
        optimizedResize.add(() => this._refreshSize());
        views.monitorNodeRemoval(
            this._containerNode, () => { this._uninstall(); });
    }

    _uninstall() {
        optimizedResize.remove(() => this._refreshSize());
    }
}

module.exports = PostContentControl;
