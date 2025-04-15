import { Column } from "../generic_table";

type SeatRow = {
  id: string;
  name: string;
  seat: string;
  eliminated: boolean;
};

export const seatsColumns: Column<SeatRow>[] = [
  {
    name: "Nom",
    uid: "name",
    render: (value) => (
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-green-700" />
        {value}
      </div>
    )
  },
  {
    name: "Siège",
    uid: "seat",
    render: (value, item) => (item.eliminated ? "Éliminé" : value)
  }
];
