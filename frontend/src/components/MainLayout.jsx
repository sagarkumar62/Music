import React from "react";
import { Outlet } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Navigation from "./Navigation";
import NowPlaying from "./NowPlaying";
import {
  selectCurrentSong,
  selectIsPlaying,
  togglePlayPause,
} from "../redux/features/songSlice";

const MainLayout = () => {
  const dispatch = useDispatch();
  const currentSong = useSelector(selectCurrentSong);
  const isPlaying = useSelector(selectIsPlaying);

  return (
    <>
      <Outlet />

      <NowPlaying
        currentSong={currentSong}
        isPlaying={isPlaying}
        togglePlayPause={() => dispatch(togglePlayPause())}
      />

      <Navigation />
    </>
  );
};

export default MainLayout;