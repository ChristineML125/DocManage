import 'package:flutter/material.dart';
import '../api/document_api.dart';
import '../widget/document_card.dart';

class FavoritesPage extends StatefulWidget {
  final String role;
  final String userType;

  const FavoritesPage({
    super.key,
    required this.role,
    required this.userType,
  });

  @override
  State<FavoritesPage> createState() => _FavoritesPageState();
}

class _FavoritesPageState extends State<FavoritesPage> {
  final TextEditingController searchController = TextEditingController();

  List<Map<String, dynamic>> favorites = [];
  List<Map<String, dynamic>> filteredFavorites = [];

  bool get isAdmin => widget.role.toLowerCase() == "admin";

  @override
  void initState() {
    super.initState();
    loadFavorites();
  }

  Future loadFavorites() async {
    try {
      final response = await DocumentApi.getFavorites();
      if (response["success"] == true) {
        setState(() {
          favorites = List<Map<String, dynamic>>.from(response["favorites"] ?? []);
          filteredFavorites = favorites;
        });
      }
    } catch (e) {
      debugPrint("Failed to load favorites: $e");
    }
  }

  Future toggleFavorite(int documentId) async {
    try {
      final response = await DocumentApi.toggleFavorite(documentId.toString());
      if (response["success"] == true && response["favorited"] == false) {
        setState(() {
          favorites = favorites.where((f) => f["documentID"] != documentId).toList();
          filteredFavorites = favorites;
        });
      }
    } catch (e) {
      debugPrint("Toggle favorite failed: $e");
    }
  }

  void searchDocuments(String query) {
    final searchText = query.toLowerCase();
    final result = favorites.where((document) {
      final documentName = (document["documentName"] ?? "").toString().toLowerCase();
      return documentName.contains(searchText);
    }).toList();
    setState(() {
      filteredFavorites = result;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF7F9FB),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 10),
              const Text(
                "Favorites",
                style: TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF191C1E),
                ),
              ),
              const SizedBox(height: 6),
              Card(
                elevation: 1,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                child: TextField(
                  controller: searchController,
                  onChanged: searchDocuments,
                  style: const TextStyle(fontSize: 13),
                  decoration: const InputDecoration(
                    hintText: "Search favorites...",
                    hintStyle: TextStyle(fontSize: 13),
                    prefixIcon: Icon(Icons.search, size: 19),
                    contentPadding: EdgeInsets.symmetric(
                      vertical: 6,
                      horizontal: 8,
                    ),
                    border: InputBorder.none,
                  ),
                ),
              ),
              const SizedBox(height: 10),
              Expanded(
                child: filteredFavorites.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Icons.star_border, size: 64, color: Color(0xFFDCE4ED)),
                            const SizedBox(height: 12),
                            Text(
                              "No favorite documents yet",
                              style: TextStyle(fontSize: 15, color: Color(0xFF7A8A9A)),
                            ),
                          ],
                        ),
                      )
                    : ListView.builder(
                        itemCount: filteredFavorites.length,
                        itemBuilder: (context, index) {
                          final doc = filteredFavorites[index];
                          final docId = doc["documentID"];
                          return DocumentCard(
                            document: doc,
                            isAdmin: isAdmin,
                            isPersonal: true,
                            isFavorited: true,
                            onUpdated: loadFavorites,
                            onToggleFavorite: docId != null
                                ? () => toggleFavorite(docId)
                                : null,
                          );
                        },
                      ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
