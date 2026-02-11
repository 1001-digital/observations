import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("ObservationsModule", (m) => {
  const observations = m.contract("Observations");

  return { observations };
});
