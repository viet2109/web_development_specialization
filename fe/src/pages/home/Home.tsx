import Posts from "../../components/posts/Posts";
import Share from "../../components/share/Share";

interface Props {}

function Home(props: Props) {
  const {} = props;
  
  return <section>
    
   <Share />
   <Posts />
 


  </section>;
}

export default Home;