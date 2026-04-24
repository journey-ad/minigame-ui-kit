import BasicPage from './BasicPage';
import FormPage from './FormPage';
import DisplayPage from './DisplayPage';
import FeedbackPage from './FeedbackPage';
import AboutPage from './AboutPage';

export default [
    { label: '基础', icon: 'box', Page: BasicPage },
    { label: '表单', icon: 'edit', Page: FormPage },
    { label: '展示', icon: 'list', Page: DisplayPage },
    { label: '反馈', icon: 'bell', Page: FeedbackPage },
    { label: '说明', icon: 'info', Page: AboutPage },
];
