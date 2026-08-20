import 'package:docmanage_mobile/pages/admin.dart';
import 'package:flutter/material.dart';

import '../api/document_api.dart';
import '../api/department_api.dart';
import '../api/user_api.dart';
import '../api/http_service.dart';

import '../widget/bottom_nav.dart';
import '../widget/summary_card.dart';
import '../widget/department_load.dart';
import '../widget/recent_documents.dart';

import 'document.dart';
import 'upload.dart';
import 'categories_page.dart';
import 'settings_page.dart';
import 'favorites_page.dart';


class Dashboard extends StatefulWidget {

  final String role;
  final String username;
  final int userId;
  final String userType;
  final bool mustChangePassword;

  const Dashboard({
    super.key,
    required this.role,
    required this.username,
    required this.userId,
    this.userType = 'company',
    this.mustChangePassword = false,
  });


  @override
  State<Dashboard> createState() => _DashboardState();

}


class _DashboardState extends State<Dashboard> {

  int currentIndex = 0;

  int totalDocuments = 0;
  int activeDocuments = 0;
  int archivedDocuments = 0;
  int totalCategories = 0;

  late String userName;
  late String userInitial;
  String? avatarPath;

  bool get isAdmin =>
      widget.role.toLowerCase() == "admin";

  bool get isPersonal =>
      widget.userType == 'personal';


  List<Map<String,dynamic>> departments = [];
  List<Map<String,dynamic>> recentDocuments = [];


  @override
  void initState() {
    super.initState();

    userName = widget.username;
    userInitial = userName[0].toUpperCase();

    loadDashboard();
    loadUserProfile();

    if (widget.mustChangePassword) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        _openSettings(forcePasswordChange: true);
      });
    }
  }

  Future<void> _openSettings({bool forcePasswordChange = false}) async {
    final result = await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => SettingsPage(
          userId: widget.userId,
          forcePasswordChange: forcePasswordChange,
          userType: widget.userType,
        ),
      ),
    );

    if (result == true) {
      await loadUserProfile();
    }
  }


  void changePage(int index){

    setState(() {
      currentIndex = index;
    });

  }


  Future loadDashboard() async {

    if (isPersonal) {
      final countResponse = await DocumentApi.getPersonalDocCount();
      final docListResponse = await DocumentApi.getPersonalDocumentList();

      setState(() {
        totalDocuments = int.tryParse(countResponse["totalDocument"].toString()) ?? 0;
        activeDocuments = int.tryParse(countResponse["activeCount"].toString()) ?? 0;
        archivedDocuments = int.tryParse(countResponse["archivedCount"].toString()) ?? 0;
        totalCategories = 0;
        departments = [];
        recentDocuments = List<Map<String,dynamic>>.from(
          docListResponse["documents"] ?? []
        );
      });
      return;
    }

    final documentResponse =
        await DocumentApi.getDocuments();

    final departmentResponse =
        await DepartmentApi.getDepartmentLoad();

    final documentListResponse =
        await DocumentApi.getDocumentList({});

    setState(() {

      totalDocuments =
          int.tryParse(documentResponse["totalDocument"].toString()) ?? 0;

      totalCategories =
          int.tryParse(documentResponse["category"].toString()) ?? 0;

      activeDocuments =
          int.tryParse(documentResponse["activeCount"].toString()) ?? 0;

      archivedDocuments =
          int.tryParse(documentResponse["archivedCount"].toString()) ?? 0;


      departments =
          List<Map<String,dynamic>>.from(
            departmentResponse["departments"] ?? []
          );


      recentDocuments =
          List<Map<String,dynamic>>.from(
            documentListResponse["documents"] ?? []
          );

    });

  }

  Future<void> loadUserProfile() async {
    final response = await UserApi.getUser(widget.userId.toString());

    if (response['success']) {
      setState(() {
        avatarPath = response['user']['AvatarPath'];
      });
    }
  }


  Widget dashboardHome(){

    return SingleChildScrollView(

      child: Padding(

        padding: const EdgeInsets.all(20),

        child: Column(

          crossAxisAlignment: CrossAxisAlignment.start,

          children:[

            const Text(
              "Dashboard Overview",
              style: TextStyle(
                fontSize:18,
                fontWeight:FontWeight.bold,
              ),
            ),


            const SizedBox(height:5),


            const Text(
              "Documentation summary",
            ),


            const SizedBox(height:20),


            GridView.count(
              crossAxisCount:2,
              shrinkWrap:true,
              childAspectRatio:1.8,

              physics:
              const NeverScrollableScrollPhysics(),

              children:[

                SummaryCard(
                  icon:Icons.description,
                  title:"Documents",
                  value:totalDocuments.toString(),
                  color:Colors.blue,
                ),

                SummaryCard(
                  icon:Icons.check_circle,
                  title:"Active",
                  value:activeDocuments.toString(),
                  color:Colors.green,
                ),

                if (!isPersonal) SummaryCard(
                  icon:Icons.category,
                  title:"Categories",
                  value:totalCategories.toString(),
                  color:Colors.orange,
                ),

                SummaryCard(
                  icon:Icons.archive,
                  title:"Archived",
                  value:archivedDocuments.toString(),
                  color:Colors.grey,
                ),

              ],

            ),


            if (!isPersonal) ...[

              const SizedBox(height:20),


              DepartmentLoad(
                departments: departments,
              ),

            ],


            const SizedBox(height:20),


            RecentDocuments(
              documents: recentDocuments,
              role: widget.role,
              userType: widget.userType,
            ),

          ],

        ),

      ),

    );

  }



  List<Widget> get pages => [

    dashboardHome(),

    Document(
      role: widget.role,
      userType: widget.userType,
    ),

    UploadPage(
      role: widget.role,
      userType: widget.userType,
    ),

    if (!isPersonal)
      CategoriesPage(
        role: widget.role
      ),

    if (isPersonal)
      FavoritesPage(
        role: widget.role,
        userType: widget.userType,
      ),

    if(isAdmin)
      AdminPage(
        role: widget.role
      ),

  ];



  @override
  Widget build(BuildContext context){

    return Scaffold(

      appBar: AppBar(

        title: Row(
          children: [

            Container(
              width: 55,
              height: 55,
              padding: const EdgeInsets.all(5),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(20),
                child: Image.asset(
                  'assets/logo.png',
                ),
              ),
            ),

            const SizedBox(width: 2),

            const Text(
              "Docly",
              style: TextStyle(
                fontWeight: FontWeight.bold,
              ),
            ),

          ],
        ),

        actions:[

          IconButton(
            icon: const Icon(Icons.settings_outlined),
            tooltip: 'Settings',
            onPressed: () => _openSettings(),
          ),

          Padding(
            padding:
            const EdgeInsets.only(right:16),

            child:GestureDetector(
              onTap: () => _openSettings(),
              child: ClipOval(
                child: avatarPath == null || avatarPath!.isEmpty
                    ? Container(
                        width: 40,
                        height: 40,
                        color: Colors.grey[300],
                        alignment: Alignment.center,
                        child: Text(
                          userInitial,
                          style: const TextStyle(
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      )
                    : Image.network(
                        HttpService.getFileUrl(
                          '/files/${Uri.encodeComponent(avatarPath!)}',
                        ),
                        width: 40,
                        height: 40,
                        fit: BoxFit.cover,
                        headers: HttpService.authorizationHeaders,
                        errorBuilder: (context, error, stackTrace) {
                          return Container(
                            width: 40,
                            height: 40,
                            color: Colors.grey[300],
                            alignment: Alignment.center,
                            child: Text(
                              userInitial,
                              style: const TextStyle(
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          );
                        },
                      ),
              )
            ),

          )

        ],

      ),


      body:pages[currentIndex],


      bottomNavigationBar:BottomNav(

        currentIndex:currentIndex,

        onTap:changePage,

        isAdmin:isAdmin,

        isPersonal:isPersonal,

      ),

    );

  }

}