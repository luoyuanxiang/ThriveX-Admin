import InfoCard from './components/Info';
import Stats from './components/Stats';

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
