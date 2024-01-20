import React, { useEffect, useState } from "react";
import Drawer from "@mui/material/Drawer";
import TinderCard from "react-tinder-card";
import ChatContainer from "../components/ChatContainer";
import { useCookies } from "react-cookie";
import axios from "axios";
import CircularProgress from "@mui/material/CircularProgress";
import InfoIcon from "@mui/icons-material/Info";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import Typography from "@mui/material/Typography";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [genderedUsers, setGenderedUsers] = useState(null);
  const [lastDirection, setLastDirection] = useState();
  const [cookies, setCookie, removeCookie] = useCookies(["user"]);
  const [isChatDrawerOpen, setChatDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isMilestonesDialogOpen, setMilestonesDialogOpen] = useState(false);

  const userId = cookies.UserId;

  const getUser = async () => {
    try {
      const response = await axios.get("http://localhost:8000/user", {
        params: { userId },
      });
      setUser(response.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const getGenderedUsers = async () => {
    try {
      const response = await axios.get("http://localhost:8000/gendered-users", {
        params: { gender: user?.gender_interest },
      });
      setGenderedUsers(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getUser();
  }, []);

  useEffect(() => {
    if (user) {
      getGenderedUsers();
    }
  }, [user]);

  const updateMatches = async (matchedUserId) => {
    try {
      await axios.put("http://localhost:8000/addmatch", {
        userId,
        matchedUserId,
      });
      getUser();
    } catch (err) {
      console.log(err);
    }
  };

  const swiped = (direction, swipedUserId) => {
    if (direction === "right") {
      updateMatches(swipedUserId);
    }
    setLastDirection(direction);
  };

  const outOfFrame = (name) => {
    console.log(name + " left the screen!");
  };

  const matchedUserIds = user?.matches
    .map(({ user_id }) => user_id)
    .concat(userId);

  const filteredGenderedUsers = genderedUsers?.filter(
    (genderedUser) => !matchedUserIds.includes(genderedUser.user_id)
  );

  const toggleChatDrawer = () => {
    setChatDrawerOpen(!isChatDrawerOpen);
  };

  const isMobile = window.innerWidth <= 768;

  const handleOpenMilestonesDialog = () => {
    setMilestonesDialogOpen(true);
  };

  const handleCloseMilestonesDialog = () => {
    setMilestonesDialogOpen(false);
  };

  return (
    <>
      {loading && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
          }}
        >
          <CircularProgress />
        </div>
      )}

      {!loading && user && (
        <div className="dashboard">
          {isMobile ? (
            <>
              <div className="show-info-button">
                <InfoIcon onClick={handleOpenMilestonesDialog} />
              </div>
              <button
                className="show-matches-button"
                onClick={toggleChatDrawer}
              >
                Show Matches
              </button>
              <Drawer
                anchor="bottom"
                open={isChatDrawerOpen}
                onClose={toggleChatDrawer}
                PaperProps={{
                  style: {
                    width: "100%",
                    height: "100%",
                  },
                }}
              >
                <ChatContainer user={user} onCloseDrawer={toggleChatDrawer} />
              </Drawer>
            </>
          ) : (
            <ChatContainer user={user} />
          )}

          <div className="swipe-container">
            <div className="card-container">
              {filteredGenderedUsers?.map((genderedUser) => (
                <TinderCard
                  className="swipe"
                  key={genderedUser.user_id}
                  onSwipe={(dir) => swiped(dir, genderedUser.user_id)}
                  onCardLeftScreen={() => outOfFrame(genderedUser.first_name)}
                >
                  <Dialog
                    open={isMilestonesDialogOpen}
                    onClose={handleCloseMilestonesDialog}
                  >
                    <DialogTitle>Info</DialogTitle>
                    <DialogContent>
                      <>
                        <Typography variant="h5" sx={{ marginBottom: 2 }}>
                          {genderedUser?.first_name}
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                          Email: {genderedUser?.email}
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                          Gender: {genderedUser?.gender_identity}
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                          Age: {2024 - genderedUser?.dob_year}
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                          Branch: {genderedUser?.branch}
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                          Year: {genderedUser?.current_year}
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                          About: {genderedUser?.about}
                        </Typography>
                      </>
                    </DialogContent>

                    <DialogActions>
                      <Button onClick={handleCloseMilestonesDialog}>
                        Close
                      </Button>
                    </DialogActions>
                  </Dialog>
                  <div
                    style={{ backgroundImage: `url(${genderedUser.url})` }}
                    className="card"
                  >
                    <h3>
                      {genderedUser.first_name}, {2024 - genderedUser.dob_year}
                    </h3>
                  </div>
                </TinderCard>
              ))}
              {/* <div className="swipe-info">
                {lastDirection ? <p>You swiped {lastDirection}</p> : <p />}
              </div> */}
            </div>
          </div>

          {/* Dialog Box */}
        </div>
      )}
    </>
  );
};

export default Dashboard;
