
 export   interface Place {
      id: string
      name: string
      description: string
      difficulty: "Easy" | "Medium" | "Hard" | "Legendary"
      timeLimit: number // in hours
      minStake: number // in ETH
      maxReward: number // multiplier
      currentStakes: number
      successRate: number
      image: string
      coordinates: { lat: number; lng: number }
      category: "Ancient" | "Mystical" | "Futuristic" | "Legendary"
    }
    
export  const INDIAN_PLACES: Place[] = [
      {
        id: "1",
        name: "The Mystic Caves of Ajanta",
        description:
          "Ancient Buddhist cave temples carved into volcanic rock, where monks once meditated in eternal silence. Navigate the sacred chambers to unlock ancient wisdom.",
        difficulty: "Medium",
        timeLimit: 6,
        minStake: 0.1,
        maxReward: 2.5,
        currentStakes: 12.4,
        successRate: 78,
        image: "/ancient-buddhist-caves.png",
        coordinates: { lat: 20.5519, lng: 75.7033 }, // Ajanta Caves, Maharashtra
        category: "Ancient",
      },
      {
        id: "2",
        name: "The Golden Temple of Amritsar",
        description:
          "A sacred Sikh shrine surrounded by the holy Amrit Sarovar. Seek the divine light that emanates from the golden dome at dawn.",
        difficulty: "Easy",
        timeLimit: 4,
        minStake: 0.05,
        maxReward: 1.8,
        currentStakes: 8.7,
        successRate: 89,
        image: "/golden-temple-amritsar.png",
        coordinates: { lat: 31.62, lng: 74.8765 }, // Golden Temple, Amritsar
        category: "Mystical",
      },
      {
        id: "3",
        name: "The Floating Palace of Udaipur",
        description:
          "A majestic palace that appears to float on Lake Pichola. Navigate the royal chambers where ancient maharajas once ruled from their aquatic fortress.",
        difficulty: "Medium",
        timeLimit: 5,
        minStake: 0.15,
        maxReward: 2.2,
        currentStakes: 15.3,
        successRate: 72,
        image: "/udaipur-palace-floating-lake-pichola-royal-chambers.png",
        coordinates: { lat: 24.5854, lng: 73.7125 }, // Lake Palace, Udaipur
        category: "Ancient",
      },
      {
        id: "4",
        name: "The Cyber Ruins of Bangalore",
        description:
          "Where ancient temples meet modern technology in India's Silicon Valley. Decode the digital mantras hidden in the quantum servers of tech giants.",
        difficulty: "Hard",
        timeLimit: 8,
        minStake: 0.25,
        maxReward: 3.2,
        currentStakes: 23.1,
        successRate: 65,
        image: "/bangalore-cyber-ruins.png",
        coordinates: { lat: 12.9716, lng: 77.5946 }, // Bangalore, Karnataka
        category: "Futuristic",
      },
      {
        id: "5",
        name: "The Himalayan Monastery of Ladakh",
        description:
          "A remote monastery perched on impossible cliffs where monks guard ancient secrets. Reach the summit before the mountain spirits awaken.",
        difficulty: "Legendary",
        timeLimit: 12,
        minStake: 0.5,
        maxReward: 5.0,
        currentStakes: 18.9,
        successRate: 42,
        image: "/ladakh-monastery-cliffs.png",
        coordinates: { lat: 34.1526, lng: 77.5771 }, // Leh, Ladakh
        category: "Legendary",
      },
      {
        id: "6",
        name: "The Backwater Labyrinths of Kerala",
        description:
          "Navigate the mystical network of canals and lagoons where ancient spice traders once sailed. Follow the whispers of the coconut palms to find the hidden treasure.",
        difficulty: "Medium",
        timeLimit: 6,
        minStake: 0.12,
        maxReward: 2.3,
        currentStakes: 11.7,
        successRate: 75,
        image: "/kerala-backwaters.png",
        coordinates: { lat: 9.4981, lng: 76.3388 }, // Alleppey, Kerala
        category: "Mystical",
      },
      {
        id: "7",
        name: "The Desert Fortress of Jaisalmer",
        description:
          "A golden sandstone citadel rising from the Thar Desert like a mirage. Navigate the maze of narrow alleys before the desert winds erase your path.",
        difficulty: "Hard",
        timeLimit: 7,
        minStake: 0.2,
        maxReward: 2.8,
        currentStakes: 16.4,
        successRate: 58,
        image: "/jaisalmer-fortress.png",
        coordinates: { lat: 26.9157, lng: 70.9083 }, // Jaisalmer, Rajasthan
        category: "Ancient",
      },
      {
        id: "8",
        name: "The Sacred Ghats of Varanasi",
        description:
          "Ancient stone steps leading to the holy Ganges where souls seek liberation. Navigate the spiritual energy that flows through the eternal city.",
        difficulty: "Medium",
        timeLimit: 5,
        minStake: 0.08,
        maxReward: 2.0,
        currentStakes: 9.2,
        successRate: 81,
        image: "/varanasi-ghats-ganges.png",
        coordinates: { lat: 25.3176, lng: 82.9739 }, // Varanasi, Uttar Pradesh
        category: "Mystical",
      },
      {
        id: "9",
        name: "The Quantum Labs of Hyderabad",
        description:
          "Where ancient Nizami architecture houses cutting-edge quantum research. Decode the algorithms hidden in the geometric patterns of Charminar.",
        difficulty: "Legendary",
        timeLimit: 10,
        minStake: 0.4,
        maxReward: 4.5,
        currentStakes: 21.8,
        successRate: 38,
        image: "/hyderabad-charminar-quantum-labs.png",
        coordinates: { lat: 17.385, lng: 78.4867 }, // Hyderabad, Telangana
        category: "Futuristic",
      },
      {
        id: "10",
        name: "The Tiger Temples of Madhya Pradesh",
        description:
          "Ancient temples hidden deep in tiger reserves where nature and spirituality converge. Navigate the jungle paths while avoiding the guardian spirits.",
        difficulty: "Hard",
        timeLimit: 9,
        minStake: 0.3,
        maxReward: 3.5,
        currentStakes: 14.6,
        successRate: 52,
        image: "/madhya-pradesh-tiger-temples.png",
        coordinates: { lat: 22.7196, lng: 75.8577 }, // Madhya Pradesh (Central location)
        category: "Ancient",
      },
    ]
    