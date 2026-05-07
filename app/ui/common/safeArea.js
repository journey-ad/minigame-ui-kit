let _top = 0, _bottom = 0, _left = 0, _right = 0;

export const safeArea = {
    init({ top = 0, bottom = 0, left = 0, right = 0 }) {
        _top = top;
        _bottom = bottom;
        _left = left;
        _right = right;
    },

    get top() { return _top; },
    get bottom() { return _bottom; },
    get left() { return _left; },
    get right() { return _right; },
};

export default safeArea;
