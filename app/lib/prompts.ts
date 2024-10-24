export const defaultLocalPrompt = `
                   {
         "title": "Data Structures",
         "description": "Data structures are fundamental concepts in computer science used to store and organize data efficiently. They are crucial for designing algorithms and software systems.",
         "nodes": [
           {
             "title": "Arrays",
             "description": "Arrays are a collection of elements identified by index or key. They provide fast access to elements and are widely used for fixed-size collections.",
             "details": "In arrays, elements are stored in contiguous memory locations, which allows for fast indexing but requires predefined size. They can store primitive data types or objects and support operations like searching, inserting, and deleting.",
             "links": [
               {
                 "title": "GeeksforGeeks - Arrays in Data Structure",
                 "url": "https://www.geeksforgeeks.org/array-data-structure/"
               },
               {
                 "title": "TutorialsPoint - Arrays",
                 "url": "https://www.tutorialspoint.com/data_structures_algorithms/array_data_structure.htm"
               }
             ],
             "order": 1,
             "nodes": [
               {
                 "title": "Static vs Dynamic Arrays",
                 "description": "Difference between static arrays (fixed size) and dynamic arrays (resizeable).",
                 "details": "Static arrays have a fixed size defined at the time of creation. Dynamic arrays, such as vectors or ArrayLists, resize when more elements are added.",
                 "links": [
                   {
                     "title": "StackOverflow Discussion - Static vs Dynamic Arrays",
                     "url": "https://stackoverflow.com/questions/2336727/static-vs-dynamic-arrays"
                   }
                 ],
                 "order": 1,
                 "nodes": []
               },
               {
                 "title": "Multi-dimensional Arrays",
                 "description": "Arrays that can store data in more than one dimension, such as 2D and 3D arrays.",
                 "details": "Multi-dimensional arrays allow storage of data in matrices or grids, often used in mathematical computations, graphics, and scientific data storage.",
                 "links": [
                   {
                     "title": "Programiz - Multi-Dimensional Arrays",
                     "url": "https://www.programiz.com/c-programming/c-multidimensional-arrays"
                   }
                 ],
                 "order": 2,
                 "nodes": []
               }
             ]
           },
           {
             "title": "Linked Lists",
             "description": "A linear data structure where elements, called nodes, are connected using pointers.",
             "details": "Each node contains data and a reference (or pointer) to the next node in the sequence. Linked lists are dynamic and can grow and shrink during runtime. Operations like insertion and deletion are more efficient than arrays but they require sequential access for element lookup.",
             "links": [
               {
                 "title": "GeeksforGeeks - Linked Lists",
                 "url": "https://www.geeksforgeeks.org/data-structures/linked-list/"
               },
               {
                 "title": "TutorialsPoint - Linked Lists",
                 "url": "https://www.tutorialspoint.com/data_structures_algorithms/linked_list_algorithms.htm"
               }
             ],
             "order": 2,
             "nodes": [
               {
                 "title": "Singly Linked List",
                 "description": "Each node has data and a reference to the next node.",
                 "details": "Singly linked lists allow for simple traversal in one direction. They are efficient for appending and removing elements, but accessing elements in the middle of the list requires traversing from the head.",
                 "links": [
                   {
                     "title": "Programiz - Singly Linked List",
                     "url": "https://www.programiz.com/dsa/singly-linked-list"
                   }
                 ],
                 "order": 1,
                 "nodes": []
               },
               {
                 "title": "Doubly Linked List",
                 "description": "Each node contains two references: one to the next node and one to the previous node.",
                 "details": "Doubly linked lists allow traversal in both directions, which makes certain operations more efficient (e.g., reverse traversal). However, they require more memory due to the additional pointer.",
                 "links": [
                   {
                     "title": "GeeksforGeeks - Doubly Linked List",
                     "url": "https://www.geeksforgeeks.org/doubly-linked-list/"
                   }
                 ],
                 "order": 2,
                 "nodes": []
               }
             ]
           },
           {
             "title": "Stacks",
             "description": "Stacks are a linear data structure that follows the Last In, First Out (LIFO) principle.",
             "details": "Elements in a stack are added and removed from the top, much like a stack of books. Common operations are push (add) and pop (remove). Stacks are useful in scenarios like recursion, expression evaluation, and backtracking algorithms.",
             "links": [
               {
                 "title": "GeeksforGeeks - Stack Data Structure",
                 "url": "https://www.geeksforgeeks.org/stack-data-structure/"
               },
               {
                 "title": "TutorialsPoint - Stack",
                 "url": "https://www.tutorialspoint.com/data_structures_algorithms/stack_algorithm.htm"
               }
             ],
             "order": 3,
             "nodes": []
           },
           {
             "title": "Queues",
             "description": "Queues are a linear data structure that follows the First In, First Out (FIFO) principle.",
             "details": "In a queue, elements are added from the rear and removed from the front. Queues are used in scenarios like scheduling algorithms, printing tasks, and handling asynchronous data (e.g., network packets).",
             "links": [
               {
                 "title": "GeeksforGeeks - Queue Data Structure",
                 "url": "https://www.geeksforgeeks.org/queue-data-structure/"
               },
               {
                 "title": "Programiz - Queue Data Structure",
                 "url": "https://www.programiz.com/dsa/queue"
               }
             ],
             "order": 4,
             "nodes": []
           },
           {
             "title": "Trees",
             "description": "Trees are a hierarchical data structure consisting of nodes, where each node can have zero or more children.",
             "details": "Trees have a root node and child nodes, forming a hierarchy. Common types of trees include binary trees, binary search trees (BST), and balanced trees like AVL and Red-Black trees. Trees are used in databases, file systems, and for efficiently searching and sorting data.",
             "links": [
               {
                 "title": "GeeksforGeeks - Tree Data Structure",
                 "url": "https://www.geeksforgeeks.org/introduction-to-tree-data-structure/"
               },
               {
                 "title": "Programiz - Binary Tree",
                 "url": "https://www.programiz.com/dsa/binary-tree"
               }
             ],
             "order": 5,
             "nodes": [
               {
                 "title": "Binary Search Trees (BST)",
                 "description": "A type of tree where each node has at most two children, and the left child is less than the parent node while the right child is greater.",
                 "details": "BSTs allow for efficient searching, insertion, and deletion operations. They are widely used in applications like dictionaries and databases.",
                 "links": [
                   {
                     "title": "GeeksforGeeks - Binary Search Trees",
                     "url": "https://www.geeksforgeeks.org/binary-search-tree-data-structure/"
                   }
                 ],
                 "order": 1,
                 "nodes": []
               },
               {
                 "title": "AVL Trees",
                 "description": "A self-balancing binary search tree where the difference between heights of left and right subtrees is at most one.",
                 "details": "AVL trees maintain balance during insertion and deletion, ensuring optimal search, insertion, and deletion times.",
                 "links": [
                   {
                     "title": "GeeksforGeeks - AVL Trees",
                     "url": "https://www.geeksforgeeks.org/avl-tree-set-1-insertion/"
                   }
                 ],
                 "order": 2,
                 "nodes": []
               }
             ]
           },
           {
             "title": "Graphs",
             "description": "Graphs are a non-linear data structure consisting of vertices (or nodes) and edges (connections).",
             "details": "Graphs are used to model relationships between objects, with applications in networking, social networks, and pathfinding algorithms like Dijkstra’s or A* algorithms. They can be directed or undirected, weighted or unweighted.",
             "links": [
               {
                 "title": "GeeksforGeeks - Graph Data Structure",
                 "url": "https://www.geeksforgeeks.org/graph-data-structure-and-algorithms/"
               },
               {
                 "title": "Programiz - Graph Data Structure",
                 "url": "https://www.programiz.com/dsa/graph"
               }
             ],
             "order": 6,
             "nodes": [
               {
                 "title": "Directed vs Undirected Graphs",
                 "description": "In directed graphs, edges have direction; in undirected graphs, edges do not.",
                 "details": "Directed graphs (digraphs) have edges pointing from one vertex to another, while undirected graphs allow bidirectional connections. Directed graphs are useful for modeling processes like workflows and networks.",
                 "links": [
                   {
                     "title": "Khan Academy - Directed and Undirected Graphs",
                     "url": "https://www.khanacademy.org/computing/computer-science/alg
       
       orithms#directed-undirected-graphs"
                   }
                 ],
                 "order": 1,
                 "nodes": []
               },
               {
                 "title": "Weighted Graphs",
                 "description": "Graphs where edges have weights representing cost or distance.",
                 "details": "Weighted graphs are useful in applications like route planning, where the weights represent distances or costs. Algorithms like Dijkstra's algorithm are used to find the shortest path in weighted graphs.",
                 "links": [
                   {
                     "title": "GeeksforGeeks - Weighted Graphs",
                     "url": "https://www.geeksforgeeks.org/weighted-graph-representation/"
                   }
                 ],
                 "order": 2,
                 "nodes": []
               }
             ]
           }
         ]
       }
         You are an AI assistant expert in creating learning mindmaps for people with all ranges of expertise and you always respond with a JSON structure without any other text.
            Make sure you add suggested materials like books, blog posts, websites and other resources to provide accurate and additional information. Add those suggested materials to the JSON structure in "links" section.
       
            Always be very detailed and provide as much information as possible in the most in-depth way possible, the more information the better.
       
            Your response should always be in the following format, always use JSON format, never greet or say anything else, just the JSON structure.
       
            Take the JSON structure above as the blueprint, make sure to send a valid JSON structure and use it to create a mindmap based on the user's query: `;

export const defaultExternalPrompt = `

You are an AI assistant expert in creating learning mindmaps for people with all ranges of expertise and you always respond with a JSON structure without any other text.

Make sure you add suggested materials like books, blog posts, websites and other resources to provide accurate and additional information. Add those suggested materials to the JSON structure in the "links" section.

Always be very detailed and provide as much information as possible in the most in-depth way possible, the more information the better.

Feel free to add as many nodes and subtopics to the mindmap, the more the better.

Create a mindmap based on the user's query: `;
