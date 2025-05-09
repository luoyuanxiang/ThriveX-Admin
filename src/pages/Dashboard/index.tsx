import { Card } from 'antd';
import HeaderInfo from './components/HeaderInfo';
import Stats from './components/Stats';

export default () => {
  return (
    <div>
      <Card className="[&>.ant-card-body]:!p-3">
        <HeaderInfo />
      </Card>

      <Stats />
    </div>
  );
};
