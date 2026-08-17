import {
  PoseJavelin03Body,
  PoseRunnerRight,
  PoseRunnerUp,
  PoseSprinter01,
  PoseSprinter03,
} from "./athlete-poses";

/** 14 athletes positioned via embedded-image CSS (polar outer + grid inner) */
export function ArenaAthletes() {
  return (
    <>
      {/* 12 o'clock: pair running upward (2) */}
      <div id="athlete-01" className="runner-athlete pose-runner-up top-outer-pair">
        <PoseRunnerUp />
      </div>
      <div id="athlete-02" className="runner-athlete pose-runner-up top-outer-pair">
        <PoseRunnerUp />
      </div>

      {/* 3 o'clock: javelin, sprinter, runner (3) */}
      <div id="athlete-03" className="javelin-athlete pose-javelin-03 right-outer-quadrant slot-top">
        <PoseJavelin03Body />
      </div>
      <div id="athlete-04" className="sprinter-athlete pose-sprinter-01 right-outer-quadrant slot-mid">
        <PoseSprinter01 />
      </div>
      <div id="athlete-05" className="runner-athlete pose-runner-right right-outer-quadrant slot-bot">
        <PoseRunnerRight />
      </div>

      {/* 6 o'clock: pair running right (2) */}
      <div id="athlete-06" className="runner-athlete pose-runner-right bottom-outer-pair">
        <PoseRunnerRight />
      </div>
      <div id="athlete-07" className="runner-athlete pose-runner-right bottom-outer-pair">
        <PoseRunnerRight />
      </div>

      {/* 9 o'clock: sprinter, javelin (#athlete-09), runner (3) */}
      <div id="athlete-08" className="sprinter-athlete pose-sprinter-03 left-outer-quadrant slot-top mirror">
        <PoseSprinter03 />
      </div>
      <div id="athlete-09" className="javelin-athlete pose-javelin-03 left-outer-quadrant slot-mid">
        <PoseJavelin03Body />
      </div>
      <div id="athlete-10" className="runner-athlete pose-runner-right left-outer-quadrant slot-bot mirror">
        <PoseRunnerRight />
      </div>

      {/* Inner ring: CSS grid (4) */}
      <div className="arena-inner-grid">
        <div className="circuit-grid-box">
          <div id="athlete-11" className="javelin-athlete pose-javelin-03 inner-circuit-box">
            <PoseJavelin03Body glow="blue" />
          </div>
        </div>

        <div id="athlete-13" className="sprinter-athlete pose-sprinter-01 center-center-top-box">
          <PoseSprinter01 />
        </div>

        <div id="athlete-14" className="sprinter-athlete pose-sprinter-01 center-center-left-box">
          <PoseSprinter01 />
        </div>

        <div className="data-grid-box">
          <div id="athlete-12" className="sprinter-athlete pose-sprinter-03 element">
            <PoseSprinter03 />
          </div>
        </div>
      </div>
    </>
  );
}
