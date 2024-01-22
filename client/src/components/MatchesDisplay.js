import axios from "axios";
import { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { Dialog, DialogContent, DialogTitle } from "@mui/material";

const MatchesDisplay = ({ matches, setClickedUser }) => {
  const [matchedProfiles, setMatchedProfiles] = useState(null);
  const [cookies, setCookie, removeCookie] = useCookies(null);
  const [selectedUser, setSelectedUser] = useState(null); // Track the selected user
  const [openDialog, setOpenDialog] = useState(false);

  const matchedUserIds = matches.map(({ user_id }) => user_id);
  const userId = cookies.UserId;

  const getMatches = async () => {
    try {
      const response = await axios.get(
        "https://tinder-clone-test-a0p4.onrender.com/users",
        {
          params: { userId: JSON.stringify(matchedUserIds) },
        }
      );
      setMatchedProfiles(response.data);
    } catch (error) {
      console.log(error);
      setMatchedProfiles([]);
    }
  };

  useEffect(() => {
    getMatches();
  }, [matches]);

  // Check if matchedProfiles is undefined or null
  if (!matchedProfiles) {
    return <p>Loading...</p>;
  }

  const filteredMatchedProfiles = matchedProfiles.filter(
    (matchedProfile) =>
      matchedProfile.matches.filter((profile) => profile.user_id === userId)
        .length > 0
  );

  const handleImageClick = (user) => {
    setSelectedUser(user); // Set the selected user when image is clicked
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  return (
    <div className="matches-display">
      {filteredMatchedProfiles.length === 0 ? (
        <p>No matches yet</p>
      ) : (
        filteredMatchedProfiles.map((match, index) => (
          <div key={index} className="match-card">
            <div
              className="img-container"
              onClick={() => handleImageClick(match)}
            >
              <img src={match?.url} alt={match?.first_name + " profile"} />
            </div>

            <Dialog open={openDialog} onClose={handleCloseDialog}>
              <DialogTitle>Profile Image</DialogTitle>
              <DialogContent>
                <img
                  className="profile-image"
                  src={selectedUser?.url}
                  alt={selectedUser?.first_name + " profile"}
                />
              </DialogContent>
            </Dialog>
            <h3 onClick={() => setClickedUser(match)}>{match?.first_name}</h3>
          </div>
        ))
      )}
    </div>
  );
};

export default MatchesDisplay;
