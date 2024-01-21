import React, { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import LogoutIcon from "@mui/icons-material/Logout";
import Skeleton from "@mui/material/Skeleton";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cookies, setCookie, removeCookie] = useCookies(["user"]);
  const userId = cookies.UserId;
  const navigate = useNavigate();

  const getUser = async () => {
    try {
      const response = await axios.get(
        "http://tinder-clone-test-a0p4.onrender.com/user",
        {
          params: { userId },
        }
      );
      setUser(response.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getUser();
  }, []);

  const logout = () => {
    removeCookie("UserId");
    removeCookie("AuthToken");
    navigate("/");
    window.location.reload();
  };

  return (
    <Card
      sx={{
        maxWidth: 400,
        margin: "auto",
        marginTop: 4,
        backgroundColor: "#f0f0f0",
      }}
    >
      <CardContent
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {loading ? (
          <Skeleton
            variant="circular"
            width={100}
            height={100}
            animation="wave"
            sx={{ marginBottom: 2 }}
          />
        ) : (
          <Avatar
            src={user?.url}
            alt="profile"
            sx={{ width: 100, height: 100, marginBottom: 2 }}
          />
        )}

        {loading ? (
          <Skeleton variant="text" width={120} height={32} animation="wave" />
        ) : (
          <Typography variant="h5" sx={{ marginBottom: 2 }}>
            {user?.first_name}
          </Typography>
        )}

        {loading ? (
          <Skeleton variant="text" width={200} animation="wave" />
        ) : (
          <Typography variant="body1" gutterBottom>
            Email: {user?.email}
          </Typography>
        )}

        {loading ? (
          <Skeleton variant="text" width={150} animation="wave" />
        ) : (
          <Typography variant="body1" gutterBottom>
            Gender: {user?.gender_identity}
          </Typography>
        )}

        {loading ? (
          <Skeleton variant="text" width={100} animation="wave" />
        ) : (
          <Typography variant="body1" gutterBottom>
            Age: {2024 - user?.dob_year}
          </Typography>
        )}

        {loading ? (
          <Skeleton
            variant="rectangular"
            width="100%"
            height={80}
            animation="wave"
            sx={{
              marginTop: 2,
              borderRadius: 8,
            }}
          />
        ) : (
          <Typography
            sx={{
              backgroundColor: "olivedrab",
              padding: 2,
              borderRadius: 8,
              opacity: 0.8,
              marginTop: 2,
            }}
          >
            <strong>About:</strong> {user?.about}
          </Typography>
        )}

        <div style={{ marginTop: "auto", paddingTop: 2 }}>
          <Button
            startIcon={<LogoutIcon />}
            onClick={logout}
            variant="outlined"
            color="error"
            sx={{ margin: "20px" }}
          >
            Logout
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default Profile;
