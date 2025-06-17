import Posts from "../components/Posts";
import Share from "../components/Share";

interface Props {}

function Home(props: Props) {
  const {} = props;

  return (
    <section>
      <Share />
      <Posts />
    </section>
  );
}

export default Home;
