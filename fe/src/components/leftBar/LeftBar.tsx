import React, { useContext } from "react";
import "../leftBar/LeftBar.css";
import Friends from "../../assets/images/1.png";
import Groups  from "../../assets/images/2.png";
import Market  from "../../assets/images/3.png";
import Watch  from "../../assets/images/4.png";
import Memories  from "../../assets/images/5.png";
import Events  from "../../assets/images/6.png";
import Gaming from "../../assets/images/7.png";
import Gallery  from "../../assets/images/8.png";
import Videos  from "../../assets/images/9.png";
import Messages  from "../../assets/images/10.png";
import Tutorials  from "../../assets/images/11.png";
import Courses  from "../../assets/images/12.png";
import Fund  from "../../assets/images/13.png";

interface User {
  profilePic: string;
  name: string;
}

const LeftBar: React.FC = () => {

  return (
    <div className="leftBar">
      <div className="container">
        <div className="menu">
          <div className="user">
            {/* <img src={"/upload/" + currentUser.profilePic} alt="Profile" />
            <span>{currentUser.name}</span> */}
          </div>
          <div className="item">
            <img src={Friends} alt="Friends" />
            <span>Friends</span>
          </div>
          <div className="item">
            <img src={Groups} alt="Groups" />
            <span>Groups</span>
          </div>
          <div className="item">
            <img src={Market} alt="Marketplace" />
            <span>Marketplace</span>
          </div>
          <div className="item">
            <img src={Watch} alt="Watch" />
            <span>Watch</span>
          </div>
          <div className="item">
            <img src={Memories} alt="Memories" />
            <span>Memories</span>
          </div>
        </div>
        <hr />
        <div className="menu">
          <span>Your shortcuts</span>
          <div className="item">
            <img src={Events} alt="Events" />
            <span>Events</span>
          </div>
          <div className="item">
            <img src={Gaming} alt="Gaming" />
            <span>Gaming</span>
          </div>
          <div className="item">
            <img src={Gallery} alt="Gallery" />
            <span>Gallery</span>
          </div>
          <div className="item">
            <img src={Videos} alt="Videos" />
            <span>Videos</span>
          </div>
          <div className="item">
            <img src={Messages} alt="Messages" />
            <span>Messages</span>
          </div>
        </div>
        <hr />
        <div className="menu">
          <span>Others</span>
          <div className="item">
            <img src={Fund} alt="Fundraiser" />
            <span>Fundraiser</span>
          </div>
          <div className="item">
            <img src={Tutorials} alt="Tutorials" />
            <span>Tutorials</span>
          </div>
          <div className="item">
            <img src={Courses} alt="Courses" />
            <span>Courses</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeftBar;