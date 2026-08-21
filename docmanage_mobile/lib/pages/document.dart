import 'package:flutter/material.dart';
import '../api/document_api.dart';
import '../api/folder_note_api.dart';
import '../widget/document_card.dart';

class Document extends StatefulWidget {
  final String role;
  final String userType;

  const Document({
    super.key,
    required this.role,
    this.userType = 'company',
  });

  @override
  State<Document> createState() => _DocumentState();
}

class _DocumentState extends State<Document> {
  final TextEditingController searchController = TextEditingController();

  List<Map<String, dynamic>> documents = [];
  List<Map<String, dynamic>> filteredDocuments = [];
  List<Map<String, dynamic>> folders = [];

  String selectedStatus = "All";
  int? selectedFolderID;
  Set<int> favoriteIds = {};

  bool get isAdmin => widget.role.toLowerCase() == "admin";
  bool get isPersonal => widget.userType == 'personal';

  @override
  void initState() {
    super.initState();
    loadDocuments();
    loadFolders();
    if (isPersonal) loadFavorites();
  }

  Future loadDocuments() async {
    final response = isPersonal
        ? await DocumentApi.getPersonalDocumentList()
        : await DocumentApi.getDocumentList({});
    setState(() {
      documents = List<Map<String, dynamic>>.from(response["documents"] ?? []);
      filteredDocuments = documents;
    });
  }

  Future loadFolders() async {
    if (!isPersonal) return;
    try {
      final response = await FolderNoteApi.getFolders();
      if (response["success"] == true) {
        setState(() {
          folders = List<Map<String, dynamic>>.from(response["folders"] ?? []);
        });
      }
    } catch (e) {
      debugPrint("Failed to load folders: $e");
    }
  }

  Future loadFavorites() async {
    try {
      final response = await DocumentApi.getFavorites();
      if (response["success"] == true) {
        final favs = List<Map<String, dynamic>>.from(response["favorites"] ?? []);
        setState(() {
          favoriteIds = favs.map((f) => f["documentID"] as int).toSet();
        });
      }
    } catch (e) {
      debugPrint("Failed to load favorites: $e");
    }
  }

  Future toggleFavorite(int documentId) async {
    try {
      final response = await DocumentApi.toggleFavorite(documentId.toString());
      if (response["success"] == true) {
        setState(() {
          if (response["favorited"] == true) {
            favoriteIds.add(documentId);
          } else {
            favoriteIds.remove(documentId);
          }
        });
      }
    } catch (e) {
      debugPrint("Toggle favorite failed: $e");
    }
  }

  void searchDocuments(String query) {
    final searchText = query.toLowerCase();

    final result = documents.where((document) {
      final fileName = (document["fileName"] ?? "").toString().toLowerCase();
      final documentName =
          (document["documentName"] ?? "").toString().toLowerCase();
      final department =
          (document["department"] ?? "").toString().toLowerCase();
      final id = (document["documentID"] ?? "").toString().toLowerCase();
      final status = (document["statusName"] ?? "Active").toString();
      final folderID = document["folderID"];

      final matchesSearch = fileName.contains(searchText) ||
          documentName.contains(searchText) ||
          department.contains(searchText) ||
          id.contains(searchText);

      final matchesStatus = selectedStatus == "All" ||
          status.toLowerCase() == selectedStatus.toLowerCase();

      final matchesFolder = selectedFolderID == null ||
          (folderID != null && folderID == selectedFolderID);

      return matchesSearch && matchesStatus && matchesFolder;
    }).toList();

    setState(() {
      filteredDocuments = result;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF7F9FB), // 页面背景色，统一设计
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 10),
              const Text(
                "All Documents",
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
                    hintText: "Search documents...",
                    hintStyle: TextStyle(fontSize: 13),
                    prefixIcon: Icon(
                      Icons.search,
                      size: 19,
                    ),
                    contentPadding: EdgeInsets.symmetric(
                      vertical: 6,
                      horizontal: 8,
                    ),
                    border: InputBorder.none,
                  ),
                ),
              ),
              const SizedBox(height: 6),
              Row(
                children: [
                  _buildFilterButton("All"),
                  const SizedBox(width: 8),
                  _buildFilterButton("Active"),
                  const SizedBox(width: 8),
                  _buildFilterButton("Archived"),
                ],
              ),
              if (isPersonal && folders.isNotEmpty) ...[
                const SizedBox(height: 8),
                SizedBox(
                  height: 34,
                  child: ListView(
                    scrollDirection: Axis.horizontal,
                    children: [
                      _buildFolderChip(null, "All"),
                      ...folders.map((f) => _buildFolderChip(
                        f["folderID"] as int,
                        f["folderName"] ?? "Folder",
                      )),
                    ],
                  ),
                ),
              ],
              const SizedBox(height: 10),
              Expanded(
                child: filteredDocuments.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Icons.folder_open, size: 64, color: Color(0xFFDCE4ED)),
                            const SizedBox(height: 12),
                            Text(
                              "No documents available",
                              style: TextStyle(fontSize: 15, color: Color(0xFF7A8A9A)),
                            ),
                          ],
                        ),
                      )
                    : ListView.builder(
                        itemCount: filteredDocuments.length,
                        itemBuilder: (context, index) {
                          final doc = filteredDocuments[index];
                          final docId = doc["documentID"];
                          return DocumentCard(
                            document: doc,
                            isAdmin: isAdmin,
                            onUpdated: loadDocuments,
                            isPersonal: isPersonal,
                            isFavorited: docId != null && favoriteIds.contains(docId),
                            onToggleFavorite: isPersonal && docId != null
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

  Widget _buildFilterButton(String status) {
    final isSelected = selectedStatus == status;

    return GestureDetector(
      onTap: () {
        setState(() {
          selectedStatus = status;
        });
        searchDocuments(searchController.text);
      },
      child: Container(
        padding: const EdgeInsets.symmetric(
          horizontal: 16,
          vertical: 7,
        ),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFF00685f) : Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isSelected ? const Color(0xFF00685f) : Colors.grey.shade300,
          ),
        ),
        child: Text(
          status,
          style: TextStyle(
            fontSize: 12,
            color: isSelected ? Colors.white : Colors.grey.shade700,
            fontWeight: FontWeight.w500,
          ),
        ),
      ),
    );
  }

  Widget _buildFolderChip(int? folderID, String name) {
    final isSelected = selectedFolderID == folderID;
    return Padding(
      padding: const EdgeInsets.only(right: 6),
      child: GestureDetector(
        onTap: () {
          setState(() {
            selectedFolderID = folderID;
          });
          searchDocuments(searchController.text);
        },
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
          decoration: BoxDecoration(
            color: isSelected ? const Color(0xFF00685f).withOpacity(0.1) : Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: isSelected ? const Color(0xFF00685f) : Colors.grey.shade300,
            ),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(Icons.folder, size: 14, color: isSelected ? const Color(0xFF00685f) : Colors.grey),
              const SizedBox(width: 4),
              Text(
                name,
                style: TextStyle(
                  fontSize: 11,
                  color: isSelected ? const Color(0xFF00685f) : Colors.grey.shade700,
                  fontWeight: isSelected ? FontWeight.w600 : FontWeight.w500,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}