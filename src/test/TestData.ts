import type { Candidate } from "@/lib/Types";
import { v4 } from "uuid";

export const testCandidates: Candidate[] = [
	{ id: v4(), firstName: "Holger", lastName: "Knauf", extra: "", title: "", list: "male", minSpot: 1 },
	{ id: v4(), firstName: "René", lastName: "Krämer", extra: "", title: "", list: "male", minSpot: 1 },
	{ id: v4(), firstName: "Torsten", lastName: "Nessel", extra: "", title: "", list: "male", minSpot: 1 },
	{ id: v4(), firstName: "Lewin", lastName: "Albrecht", extra: "", title: "", list: "male", minSpot: 3 },
	{ id: v4(), firstName: "Detlef", lastName: "Barsuhn", extra: "", title: "", list: "male", minSpot: 3 },
	{ id: v4(), firstName: "Stefan", lastName: "Franke", extra: "", title: "", list: "male", minSpot: 3 },
	{ id: v4(), firstName: "Phil-Dominik", lastName: "Renkauf", extra: "", title: "", list: "male", minSpot: 3 },
	{ id: v4(), firstName: "Michael", lastName: "Reuther", extra: "", title: "Dr.", list: "male", minSpot: 3 },
	{ id: v4(), firstName: "Ron-David", lastName: "Röder", extra: "", title: "", list: "male", minSpot: 3 },
	{ id: v4(), firstName: "Dominik", lastName: "Springer", extra: "", title: "", list: "male", minSpot: 3 },
	{ id: v4(), firstName: "Thorsten", lastName: "Vögler", extra: "", title: "", list: "male", minSpot: 3 },
	{ id: v4(), firstName: "Jens", lastName: "Biebricher", extra: "", title: "", list: "male", minSpot: 5 },
	{ id: v4(), firstName: "Sascha", lastName: "Kolhey", extra: "", title: "", list: "male", minSpot: 5 },
	{ id: v4(), firstName: "Markus", lastName: "Langer", extra: "", title: "", list: "male", minSpot: 6 },
	{ id: v4(), firstName: "Phillip", lastName: "Leisner", extra: "", title: "", list: "male", minSpot: 7 },
	{ id: v4(), firstName: "Marvin Maurice", lastName: "Ballat", extra: "", title: "", list: "male", minSpot: 10 },
	{ id: v4(), firstName: "Burak", lastName: "Bagis", extra: "", title: "", list: "male", minSpot: 12 },
	{ id: v4(), firstName: "Isabel", lastName: "Arens", extra: "", title: "", list: "female", minSpot: 1 },
	{ id: v4(), firstName: "Alexandra", lastName: "Barsuhn", extra: "", title: "", list: "female", minSpot: 1 },
	{ id: v4(), firstName: "Sabrina", lastName: "Hinz", extra: "", title: "", list: "female", minSpot: 1 },
	{ id: v4(), firstName: "Stefanie", lastName: "Ludwig", extra: "", title: "", list: "female", minSpot: 1 },
	{ id: v4(), firstName: "Kerstin", lastName: "Mikolajewski", extra: "", title: "", list: "female", minSpot: 1 },
	{ id: v4(), firstName: "Shirin", lastName: "Mohr", extra: "", title: "", list: "female", minSpot: 1 },
	{ id: v4(), firstName: "Marine", lastName: "Nowicki", extra: "", title: "", list: "female", minSpot: 1 },
	{ id: v4(), firstName: "Loreen Lisanne", lastName: "Reemen", extra: "", title: "", list: "female", minSpot: 1 },
	{ id: v4(), firstName: "Luca Loreen", lastName: "Kraft", extra: "", title: "", list: "female", minSpot: 3 },
	{ id: v4(), firstName: "Anne", lastName: "Niegel", extra: "", title: "", list: "female", minSpot: 3 },
	{ id: v4(), firstName: "Joan", lastName: "Sander", extra: "", title: "", list: "female", minSpot: 5 },
	{
		id: v4(),
		firstName: "Michaela",
		lastName: "Schneider-Wettstein",
		extra: "",
		title: "",
		list: "female",
		minSpot: 5
	},
	{ id: v4(), firstName: "Karen", lastName: "Zeller", extra: "", title: "", list: "female", minSpot: 5 },
	{ id: v4(), firstName: "Sacha", lastName: "Heerschop", extra: "", title: "", list: "female", minSpot: 6 },
	{ id: v4(), firstName: "Anett", lastName: "Schneeweiß-Hachimi", extra: "", title: "", list: "female", minSpot: 6 },
	{ id: v4(), firstName: "Elisabeth", lastName: "Heister", extra: "", title: "", list: "female", minSpot: 10 },
	{ id: v4(), firstName: "Sara Maria", lastName: "Zimpelmann", extra: "", title: "", list: "female", minSpot: 15 }
];