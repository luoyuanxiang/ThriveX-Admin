import { Card } from 'antd';
import HeaderInfo from './components/HeaderInfo';
import Stats from './components/Stats';
import InfoCard from './components/Info';

export default () => {
  return (
    <div>
      <InfoCard />
      
      {/* <Card className='[&>.ant-card-body]:!p-3 border border-stroke'>
        <HeaderInfo />
      </Card> */}

      <Stats />
    </div>
  );
};