import { Button, Result } from 'antd'

export default () => {
    return (
        <>
            <Result
                status="404"
                title="404"
                subTitle="Sorry, the page you visited does not exist."
                extra={<Button type="primary" onClick={() => window.open('https://github.com/LiuYuYang01/ThriveX-Admin')}>借此机会帮忙点个star</Button>}
            />
        </>
    )
}