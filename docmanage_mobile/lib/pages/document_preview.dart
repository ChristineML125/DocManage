import 'dart:io';
import 'dart:typed_data';

import 'package:file_picker/file_picker.dart';
import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:path_provider/path_provider.dart';
import 'package:public_file_saver/public_file_saver.dart';
import 'package:share_plus/share_plus.dart';
import 'package:syncfusion_flutter_pdfviewer/pdfviewer.dart';
import 'package:url_launcher/url_launcher.dart';

import '../api/document_api.dart';
import '../api/http_service.dart';
import '../widget/version_preview.dart';
import '../widget/add_new_version.dart';

// DOCUMENT PREVIEW
class DocumentPreview extends StatefulWidget {
  final Map<String, dynamic> document;

  const DocumentPreview({
    super.key,
    required this.document,
  });

  @override
  State<DocumentPreview> createState() =>
      _DocumentPreviewState();
}

class _DocumentPreviewState extends State<DocumentPreview> {

  bool isExpanded = false;
  bool isLoadingHistory = false;
  bool isGeneratingSummary = false;
  bool isLoadingPreview = false;

  String? exportingFormat;

  String? previewUrl;
  String? previewType;

  String? aiSummary;

  Uint8List? pdfBytes;

  List<Map<String, dynamic>> versions = [];

  Map<String, dynamic> get document =>
      widget.document;


  static const double
      _collapsedSheetHeight = 100;

  static const double
      _expandedSheetHeight = 430;


  @override
  void initState() {
    super.initState();

    loadPreview();
    loadVersionHistory();
    loadExistingSummary();
  }

  void toggleSheet() {

    setState(() {
      isExpanded =
          !isExpanded;
    });
  }


  void _onVerticalDragUpdate(
    DragUpdateDetails details,
  ) {

    final delta =
        details.primaryDelta;

    if (delta == null) return;

    if (delta < -5 &&
        !isExpanded) {

      setState(() {
        isExpanded = true;
      });
    }

    if (delta > 5 &&
        isExpanded) {

      setState(() {
        isExpanded = false;
      });
    }
  }


  void _onVerticalDragEnd(
    DragEndDetails details,
  ) {

    final velocity =
        details.primaryVelocity ??
            0;

    if (velocity < -300) {

      setState(() {
        isExpanded = true;
      });

    } else if (velocity > 300) {

      setState(() {
        isExpanded = false;
      });
    }
  }

  Future<void> loadPreview() async {
    final documentId = document["documentID"];

    if (documentId == null) {
      debugPrint("PREVIEW: documentID is null");
      return;
    }

    if (!mounted) {
      return;
    }

    setState(() {
      isLoadingPreview = true;
      previewUrl = null;
      previewType = null;
      pdfBytes = null;
    });

    try {
      debugPrint("================================");
      debugPrint("LOAD DOCUMENT PREVIEW");
      debugPrint("DOCUMENT ID: $documentId");
      debugPrint("================================");

      final response =
          await DocumentApi.previewDocument(
        documentId.toString(),
      );

      debugPrint(
        "PREVIEW API RESPONSE: $response",
      );

      if (response == null) {
        throw Exception(
          "Preview API returned null",
        );
      }

      final fileUrl =
          response["fileUrl"]?.toString();

      debugPrint(
        "PREVIEW FILE URL: $fileUrl",
      );

      if (fileUrl == null ||
          fileUrl.isEmpty) {
        throw Exception(
          "No fileUrl returned from preview API",
        );
      }

      final lower =
          fileUrl.toLowerCase().split("?").first;

      debugPrint(
        "PREVIEW FILE TYPE: $lower",
      );

      if (_isImage(lower)) {
        final fullUrl =
            fileUrl.startsWith("http")
                ? fileUrl
                : HttpService.getFileUrl(fileUrl);

        debugPrint(
          "IMAGE PREVIEW URL: $fullUrl",
        );

        if (!mounted) return;

        setState(() {
          previewUrl = fullUrl;
          previewType = "image";
          pdfBytes = null;
          isLoadingPreview = false;
        });

        return;
      }

      if (lower.endsWith(".pdf")) {
        debugPrint(
          "PREVIEW TYPE: PDF",
        );

        await _loadMainPdf(fileUrl);

        return;
      }

      if (_isOffice(lower)) {
        debugPrint(
          "PREVIEW TYPE: OFFICE",
        );

        debugPrint(
          "Converting Office document to PDF...",
        );

        final exportResponse =
            await DocumentApi.exportPDF(
          documentId.toString(),
        );

        debugPrint(
          "EXPORT PDF RESPONSE: $exportResponse",
        );

        if (exportResponse == null) {
          throw Exception(
            "PDF conversion returned null",
          );
        }

        if (exportResponse["success"] == false) {
          throw Exception(
            exportResponse["message"] ??
                "PDF conversion failed",
          );
        }

        final downloadUrl =
            exportResponse["downloadUrl"]
                ?.toString();

        debugPrint(
          "CONVERTED PDF URL: $downloadUrl",
        );

        if (downloadUrl == null ||
            downloadUrl.isEmpty) {
          throw Exception(
            "No downloadUrl returned from PDF conversion",
          );
        }

        await _loadMainPdf(downloadUrl);

        return;
      }

      throw Exception(
        "Unsupported file type: $fileUrl",
      );
    } catch (e, stackTrace) {
      debugPrint( "================================",);
      debugPrint( "PREVIEW FAILED", );
      debugPrint( "ERROR: $e", );
      debugPrint( "STACK TRACE: $stackTrace",);
      debugPrint( "================================",);

      if (!mounted) { return;}

      setState(() {
        isLoadingPreview = false;
        pdfBytes = null;
        previewUrl = null;
        previewType = null;
      });

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            "Preview failed: $e",
          ),
        ),
      );
    }
  }

  Future<void> _loadMainPdf(
    String fileUrl,
  ) async {
    final url = HttpService.getFileUrl(fileUrl);

    debugPrint("===============================");
    debugPrint("MAIN DOCUMENT PDF");
    debugPrint("FILE URL: $fileUrl");
    debugPrint("FULL URL: $url");
    debugPrint("===============================");

    final response = await http.get(
      Uri.parse(url),
      headers: HttpService.authorizationHeaders,
    );

    debugPrint("PDF STATUS: ${response.statusCode}");
    debugPrint("PDF SIZE: ${response.bodyBytes.length}");
    debugPrint(
      "PDF CONTENT TYPE: ${response.headers['content-type']}",
    );

    if (response.statusCode != 200) {
      throw Exception(
        "Failed to download PDF: ${response.statusCode}",
      );
    }

    if (response.bodyBytes.isEmpty) {
      throw Exception("PDF file is empty");
    }

    if (!mounted) return;

    setState(() {
      previewUrl = url;
      previewType = "pdf";
      pdfBytes = response.bodyBytes;
      isLoadingPreview = false;
    });
  }

  bool _isImage(
    String path,
  ) {

    return path.endsWith(".png") ||
        path.endsWith(".jpg") ||
        path.endsWith(".jpeg") ||
        path.endsWith(".webp");
  }


  bool _isOffice(
    String path,
  ) {

    return path.endsWith(".doc") ||
        path.endsWith(".docx") ||
        path.endsWith(".xls") ||
        path.endsWith(".xlsx");
  }

  Future<void> loadVersionHistory() async {

    final documentId =
        document["documentID"];

    if (documentId == null) return;

    setState(() {
      isLoadingHistory = true;
    });

    try {

      final response = await DocumentApi.getVersionList(
        documentId.toString(),
      );

      if (!mounted) return;

      final rawVersions = response["versions"] ?? [];

      setState(() {

        versions =
            List<Map<String, dynamic>>.from(
          rawVersions,
        );

        isLoadingHistory =
            false;
      });

    } catch (e) {

      debugPrint(
        "VERSION HISTORY FAILED: $e",
      );

      if (!mounted) return;

      setState(() {
        isLoadingHistory = false;
      });

      ScaffoldMessenger.of(context)
          .showSnackBar(
        SnackBar(
          content: Text(
            "Failed to load version history: $e",
          ),
        ),
      );
    }
  }

  Future<void> openHistory(
    Map<String, dynamic> item,
  ) async {
    final result = await showDialog<bool>(
      context: context,
      builder: (context) {
        return VersionPreview(
          document: document,
          version: item,
        );
      },
    );

    if (result == true && mounted) {
      await loadPreview();
      await loadVersionHistory();

      setState(() {
        isExpanded = false;
      });

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text(
            "Current version updated successfully.",
          ),
        ),
      );
    }
  }
    
  
  Future<void> downloadDocument() async {

    final fileUrl =
        previewUrl;

    if (fileUrl == null ||
        fileUrl.isEmpty) {

      ScaffoldMessenger.of(context)
          .showSnackBar(
        const SnackBar(
          content: Text(
            "File is not available",
          ),
        ),
      );

      return;
    }

    try {

      final fullUrl =
          fileUrl.startsWith("http")
              ? fileUrl
              : HttpService.getFileUrl(
                  fileUrl,
                );

      final response =
          await http.get(
        Uri.parse(fullUrl),
        headers:
            HttpService.authorizationHeaders,
      );

      if (response.statusCode != 200) {
        throw Exception(
          "Download failed: "
          "${response.statusCode}",
        );
      }

      if (response.bodyBytes.isEmpty) {
        throw Exception(
          "File is empty",
        );
      }

      String fileName =
          document["filePath"] ??
          document["documentName"] ??
          "document";

      fileName =
          fileName
              .split("/")
              .last;

      fileName =
          fileName
              .split("\\")
              .last;

      if (!fileName.contains(".")) {

        final type =
            response
                    .headers[
                  "content-type"
                ] ??
                "";

        if (type.contains("pdf")) {
          fileName += ".pdf";
        } else if (
            type.contains("word")) {
          fileName += ".docx";
        } else if (
            type.contains("sheet")) {
          fileName += ".xlsx";
        } else if (
            type.contains("image")) {
          fileName += ".png";
        }
      }

      final savedFile =
          await PublicFileSaver()
              .saveBytes(
        bytes:
            response.bodyBytes,
        fileName:
            fileName,
        mimeType:
            response.headers[
                  "content-type"] ??
                "application/octet-stream",
      );

      if (savedFile == null) {
        throw Exception(
          "File could not be saved",
        );
      }

      if (!mounted) return;

      ScaffoldMessenger.of(context)
          .showSnackBar(
        SnackBar(
          content: Text(
            "Downloaded: $fileName\n"
            "Saved to Downloads",
          ),

          duration:
              const Duration(
            seconds: 5,
          ),

          action:
              savedFile.uri == null ||
                      savedFile.uri!.isEmpty
                  ? null
                  : SnackBarAction(
                      label: "OPEN",

                      onPressed: () async {

                        final uri =
                            Uri.parse(
                          savedFile.uri!,
                        );

                        await launchUrl(
                          uri,
                          mode:
                              LaunchMode
                                  .externalApplication,
                        );
                      },
                    ),
        ),
      );

    } catch (e) {

      debugPrint(
        "DOWNLOAD FAILED: $e",
      );

      if (!mounted) return;

      ScaffoldMessenger.of(context)
          .showSnackBar(
        SnackBar(
          content:
              Text(
            "Download failed: $e",
          ),
        ),
      );
    }
  }

  Future<void> shareDocument() async {

    final fileUrl =
        previewUrl;

    if (fileUrl == null ||
        fileUrl.isEmpty) {

      ScaffoldMessenger.of(context)
          .showSnackBar(
        const SnackBar(
          content: Text(
            "File is not available",
          ),
        ),
      );

      return;
    }

    try {

      final fullUrl =
          fileUrl.startsWith("http")
              ? fileUrl
              : HttpService.getFileUrl(
                  fileUrl,
                );

      final response =
          await http.get(
        Uri.parse(fullUrl),
        headers:
            HttpService.authorizationHeaders,
      );

      if (response.statusCode != 200) {
        throw Exception(
          "Failed to download file",
        );
      }

      if (response.bodyBytes.isEmpty) {
        throw Exception(
          "File is empty",
        );
      }

      final directory =
          await getTemporaryDirectory();

      String fileName =
          document["filePath"] ??
          document["documentName"] ??
          "document";

      fileName =
          fileName
              .split("/")
              .last
              .split("\\")
              .last;

      if (!fileName.contains(".")) {

        final type =
            response
                    .headers[
                  "content-type"
                ] ??
                "";

        if (type.contains("pdf")) {
          fileName += ".pdf";
        } else if (
            type.contains("word")) {
          fileName += ".docx";
        } else if (
            type.contains("sheet")) {
          fileName += ".xlsx";
        }
      }

      final file =
          File(
        "${directory.path}/$fileName",
      );

      await file.writeAsBytes(
        response.bodyBytes,
        flush: true,
      );

      await SharePlus.instance.share(
        ShareParams(
          files: [
            XFile(
              file.path,
            ),
          ],

          text:
              document["documentName"] ??
                  "Document",
        ),
      );

    } catch (e) {

      if (!mounted) return;

      ScaffoldMessenger.of(context)
          .showSnackBar(
        SnackBar(
          content:
              Text(
            "Share failed: $e",
          ),
        ),
      );
    }
  }

  Future<void> loadExistingSummary() async {

    final documentId =
        document["documentID"];

    if (documentId == null) return;

    try {

      final response =
          await DocumentApi.getAISummary(
        documentId.toString(),
      );

      if (!mounted) return;

      final summary =
          response?["summary"];

      if (summary != null &&
          summary
              .toString()
              .trim()
              .isNotEmpty) {

        setState(() {
          aiSummary =
              summary.toString();
        });
      }

    } catch (e) {

      debugPrint(
        "NO EXISTING AI SUMMARY: $e",
      );
    }
  }


  Future<void> generateSummary() async {

    final documentId = document["documentID"];

    if (documentId == null) {
      return;
    }

    if (isGeneratingSummary) {
      return;
    }

    setState(() {
      isGeneratingSummary = true;
    });

    try {

      debugPrint( "================================", );
      debugPrint( "GENERATE AI SUMMARY", );
      debugPrint( "DOCUMENT ID: $documentId", );
      debugPrint( "================================", );

      final response =
          await DocumentApi
              .generateAISummary(
        documentId.toString(),
      );

      debugPrint(
        "AI RESPONSE: $response",
      );

      if (!mounted) return;

      final summary =
          response?["summary"];

      if (summary != null &&
          summary
              .toString()
              .trim()
              .isNotEmpty) {

        setState(() {
          aiSummary = summary.toString();
          isGeneratingSummary =
              false;
        });

      } else {

        await showAISummary();

        if (mounted) {
          setState(() {
            isGeneratingSummary =
                false;
          });
        }
      }

    } catch (e) {

      debugPrint(
        "AI SUMMARY FAILED: $e",
      );

      if (!mounted) return;

      setState(() {
        isGeneratingSummary =
            false;
      });

      ScaffoldMessenger.of(context)
          .showSnackBar(
        SnackBar(
          content: Text(
            "Failed to generate AI summary: $e",
          ),
        ),
      );
    }
  }


  Future<void> showAISummary() async {

    final documentId =
        document["documentID"];

    if (documentId == null) {
      return;
    }

    try {

      final response =
          await DocumentApi.getAISummary(
        documentId.toString(),
      );

      if (!mounted) return;

      final summary =
          response?["summary"];

      if (summary == null ||
          summary
              .toString()
              .trim()
              .isEmpty) {

        setState(() {
          aiSummary = null;
        });

        return;
      }

      setState(() {
        aiSummary =
            summary.toString();
      });

    } catch (e) {

      debugPrint(
        "GET AI SUMMARY FAILED: $e",
      );
    }
  }

  Future<void> showAddNewVersionDialog() async {
    final documentId = document['documentID'];

    if (documentId == null) {
      return;
    }

    await showDialog(
      context: context,
      barrierDismissible: false,
      builder: (dialogContext) {
        return AddNewVersionDialog(
          documentId: documentId.toString(),

          onUploaded: () async {
            await loadVersionHistory();
            await loadPreview();
          },
        );
      },
    );
  }


  void _showDismissOnTapSnackBar(SnackBar snackBar) {
    final messenger = ScaffoldMessenger.of(context);
    messenger.hideCurrentSnackBar();

    final controller = messenger.showSnackBar(snackBar);

    void onPointerUp(PointerEvent event) {
      if (event is PointerUpEvent) {
        messenger.hideCurrentSnackBar();
        GestureBinding.instance.pointerRouter
            .removeGlobalRoute(onPointerUp);
      }
    }

    GestureBinding.instance.pointerRouter.addGlobalRoute(onPointerUp);

    controller.closed.then((_) {
      GestureBinding.instance.pointerRouter
          .removeGlobalRoute(onPointerUp);
    });
  }

  Future<void> _exportDocument(
    String format,
  ) async {

    final documentId =
        document["documentID"];

    if (documentId == null ||
        exportingFormat != null) {
      return;
    }

    try {

      setState(() {
        exportingFormat =
            format;
      });

      final response =
          switch (format) {

        "PDF" =>
            await DocumentApi.exportPDF(
          documentId.toString(),
        ),

        "DOCX" =>
            await DocumentApi.exportDOCX(
          documentId.toString(),
        ),

        "XLSX" =>
            await DocumentApi.exportXLSX(
          documentId.toString(),
        ),

        _ =>
            throw Exception(
          "Unsupported export format",
        ),
      };

      if (response == null ||
          response["success"] != true) {

        throw Exception(
          response?["message"] ??
              "Conversion failed",
        );
      }

      final downloadUrl =
          response["downloadUrl"]
              ?.toString();

      if (downloadUrl == null ||
          downloadUrl.isEmpty) {

        throw Exception(
          "Converted file is not available",
        );
      }

      final downloadResponse =
          await http.get(
        Uri.parse(HttpService.getFileUrl(downloadUrl)),
        headers:
            HttpService.authorizationHeaders,
      );

      if (downloadResponse.statusCode !=
              200 ||
          downloadResponse
              .bodyBytes
              .isEmpty) {

        throw Exception(
          "Unable to download converted file",
        );
      }

      final sourceName =
          (
            response["documentName"] ??
            document["documentName"] ??
            "document"
          )
              .toString()
              .replaceAll(
                RegExp(
                  r'[\\/:*?"<>|]',
                ),
                "_",
              );

      final cleanName =
          sourceName.replaceFirst(
        RegExp(
          r'\.[^.]+$',
        ),
        '',
      );

      final fileName =
          "$cleanName.${format.toLowerCase()}";

      final savedFile =
          await PublicFileSaver()
              .saveBytes(
        bytes:
            downloadResponse.bodyBytes,

        fileName:
            fileName,

        mimeType:
            downloadResponse
                    .headers[
                "content-type"] ??
                "application/octet-stream",
      );

      if (savedFile == null) {
        throw Exception(
          "File could not be saved",
        );
      }

      if (!mounted) return;

      _showDismissOnTapSnackBar(
        SnackBar(
          content: Text(
            "Download successful: "
            "$fileName\n"
            "Saved to Downloads",
          ),

          duration:
              const Duration(
            seconds: 6,
          ),

          action:
              savedFile.uri == null ||
                      savedFile.uri!.isEmpty
                  ? null
                  : SnackBarAction(
                      label: "OPEN",

                      onPressed: () {
                        launchUrl(
                          Uri.parse(
                            savedFile.uri!,
                          ),

                          mode:
                              LaunchMode
                                  .externalApplication,
                        );
                      },
                    ),
        ),
      );

    } catch (e) {

      if (mounted) {

        ScaffoldMessenger.of(context)
            .showSnackBar(
          SnackBar(
            content:
                Text(
              "$format export failed: $e",
            ),
          ),
        );
      }

    } finally {

      if (mounted) {

        setState(() {
          exportingFormat =
              null;
        });
      }
    }
  }


  Future<void> exportPDF() =>
      _exportDocument("PDF");

  Future<void> exportDOCX() =>
      _exportDocument("DOCX");

  Future<void> exportXLSX() =>
      _exportDocument("XLSX");


  // ==========================================================
  // ACTION BUTTON
  // ==========================================================

  Widget buildActionButton({
    required IconData icon,
    required String label,
    required Future Function() onTap,
  }) {

    return InkWell(

      onTap:
          exportingFormat != null
              ? null
              : onTap,

      borderRadius:
          BorderRadius.circular(
        10,
      ),

      child:
          Container(

        padding:
            const EdgeInsets
                .symmetric(
          horizontal: 8,
          vertical: 10,
        ),

        decoration:
            BoxDecoration(
          color:
              Colors.white,

          borderRadius:
              BorderRadius.circular(
            10,
          ),

          border:
              Border.all(
            color:
                const Color(
              0xFFBDC9C5,
            ),
          ),
        ),

        child:
            Column(
          mainAxisSize:
              MainAxisSize.min,

          children: [

            Icon(
              icon,
              size: 21,

              color:
                  label ==
                          "AI Summary"
                      ? const Color(
                          0xFF006B5E,
                        )
                      : const Color(
                          0xFF3E4946,
                        ),
            ),

            const SizedBox(
              height: 5,
            ),

            Text(
              label,

              style:
                  const TextStyle(
                fontSize: 10,
                fontWeight:
                    FontWeight.w600,
              ),

              overflow:
                  TextOverflow.ellipsis,
            ),
          ],
        ),
      ),
    );
  }


  // ==========================================================
  // ACTION SECTION
  // ==========================================================

  Widget buildActionSection() {

    return Column(
      crossAxisAlignment:
          CrossAxisAlignment.start,

      children: [

        const Text(
          "Document actions",

          style:
              TextStyle(
            fontSize: 14,
            fontWeight:
                FontWeight.bold,
          ),
        ),

        const SizedBox(
          height: 10,
        ),

        Row(
          children: [

            Expanded(
              child:
                  buildActionButton(
                icon:
                    Icons.auto_awesome,

                label:
                    isGeneratingSummary
                        ? "Working..."
                        : "AI Summary",

                onTap:
                    generateSummary,
              ),
            ),

            const SizedBox(
              width: 7,
            ),

            Expanded(
              child:
                  buildActionButton(
                icon:
                    Icons.picture_as_pdf,

                label:
                    exportingFormat ==
                            "PDF"
                        ? "Working..."
                        : "Export PDF",

                onTap:
                    exportPDF,
              ),
            ),

            const SizedBox(
              width: 7,
            ),

            Expanded(
              child:
                  buildActionButton(
                icon:
                    Icons.table_chart,

                label:
                    exportingFormat ==
                            "XLSX"
                        ? "Working..."
                        : "Export XLSX",

                onTap:
                    exportXLSX,
              ),
            ),

            const SizedBox(
              width: 7,
            ),

            Expanded(
              child:
                  buildActionButton(
                icon:
                    Icons.description,

                label:
                    exportingFormat ==
                            "DOCX"
                        ? "Working..."
                        : "Export DOCX",

                onTap:
                    exportDOCX,
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget buildAISummarySection() {

    return Column(
      crossAxisAlignment:
          CrossAxisAlignment.start,

      children: [

        const Divider(),

        const SizedBox(
          height: 12,
        ),

        Row(
          children: [

            Container(
              width: 34,
              height: 34,

              decoration:
                  BoxDecoration(
                color:
                    Colors.teal.shade50,

                borderRadius:
                    BorderRadius.circular(
                  10,
                ),
              ),

              child:
                  const Icon(
                Icons.auto_awesome,
                size: 18,
                color:
                    Colors.teal,
              ),
            ),

            const SizedBox(
              width: 10,
            ),

            const Expanded(
              child:
                  Text(
                "AI Summary",

                style:
                    TextStyle(
                  fontSize: 14,
                  fontWeight:
                      FontWeight.bold,
                ),
              ),
            ),
          ],
        ),

        const SizedBox(
          height: 10,
        ),

        if (isGeneratingSummary)

          Container(
            width:
                double.infinity,

            padding:
                const EdgeInsets.all(
              16,
            ),

            decoration:
                BoxDecoration(
              color:
                  Colors.teal.shade50,

              borderRadius:
                  BorderRadius.circular(
                12,
              ),
            ),

            child:
                Row(
              children: [

                const SizedBox(
                  width: 20,
                  height: 20,

                  child:
                      CircularProgressIndicator(
                    strokeWidth:
                        2.5,

                    color:
                        Color(
                      0xFF00796B,
                    ),
                  ),
                ),

                const SizedBox(
                  width: 12,
                ),

                Expanded(
                  child:
                      Text(
                    "Reading the document and preparing key highlights...",

                    style:
                        TextStyle(
                      fontSize: 12,
                      color:
                          Colors.teal
                              .shade900,
                    ),
                  ),
                ),
              ],
            ),
          )

        else if (
            aiSummary != null &&
            aiSummary!
                .trim()
                .isNotEmpty)

          Container(
            width:
                double.infinity,

            padding:
                const EdgeInsets.all(
              14,
            ),

            decoration:
                BoxDecoration(
              color:
                  Colors.grey.shade50,

              borderRadius:
                  BorderRadius.circular(
                12,
              ),

              border:
                  Border.all(
                color:
                    Colors.grey.shade200,
              ),
            ),

            child:
                _buildSummaryContent(
              aiSummary!,
            ),
          )

        else

          Container(
            width:
                double.infinity,

            padding:
                const EdgeInsets.all(
              14,
            ),

            decoration:
                BoxDecoration(
              color:
                  Colors.grey.shade50,

              borderRadius:
                  BorderRadius.circular(
                12,
              ),

              border:
                  Border.all(
                color:
                    Colors.grey.shade200,
              ),
            ),

            child:
                const Text(
              "Tap AI Summary to generate key highlights for this document.",

              style:
                  TextStyle(
                fontSize: 12,
                color:
                    Colors.grey,
                height:
                    1.5,
              ),
            ),
          ),
      ],
    );
  }


  Widget _buildSummaryContent(
    String summary,
  ) {

    final lines =
        summary
            .split("\n")
            .map(
              (line) =>
                  line.trim(),
            )
            .where(
              (line) =>
                  line.isNotEmpty,
            )
            .toList();

    return Column(
      crossAxisAlignment:
          CrossAxisAlignment.start,

      children:
          lines.map(
        (line) {

          final cleaned =
              line.replaceFirst(
            RegExp(
              r'^[•\-\*]\s*',
            ),
            '',
          );

          return Padding(
            padding:
                const EdgeInsets.only(
              bottom: 9,
            ),

            child:
                Row(
              crossAxisAlignment:
                  CrossAxisAlignment
                      .start,

              children: [

                const Padding(
                  padding:
                      EdgeInsets.only(
                    top: 3,
                  ),

                  child:
                      Icon(
                    Icons
                        .check_circle_outline,

                    size: 16,

                    color:
                        Color(
                      0xFF00796B,
                    ),
                  ),
                ),

                const SizedBox(
                  width: 8,
                ),

                Expanded(
                  child:
                      Text(
                    cleaned,

                    style:
                        const TextStyle(
                      fontSize: 12,
                      height: 1.5,
                      color:
                          Colors.black87,
                    ),
                  ),
                ),
              ],
            ),
          );
        },
      ).toList(),
    );
  }


  // ==========================================================
  // HISTORY
  // ==========================================================

  Widget buildHistoryItem(
    Map<String, dynamic> item,
  ) {

    final version =
        item["versionNum"] ??
        item["version"] ??
        1;

    final date =
        item["date"] ??
        item["updateDate"] ??
        item["createdAt"] ??
        "";

    final user =
        item["uploadedBy"] ??
        item["updatedBy"] ??
        item["userName"] ??
        "Admin";

    return InkWell(

      onTap: () {
        openHistory(
          item,
        );
      },

      borderRadius:
          BorderRadius.circular(
        12,
      ),

      child:
          Padding(
        padding:
            const EdgeInsets
                .symmetric(
          vertical: 9,
        ),

        child:
            Row(
          children: [

            Container(
              width: 36,
              height: 36,

              decoration:
                  BoxDecoration(
                color:
                    Colors.teal.shade50,

                borderRadius:
                    BorderRadius.circular(
                  10,
                ),
              ),

              child:
                  const Icon(
                Icons.history,
                size: 19,
                color:
                    Colors.teal,
              ),
            ),

            const SizedBox(
              width: 10,
            ),

            Expanded(
              child:
                  Column(
                crossAxisAlignment:
                    CrossAxisAlignment
                        .start,

                children: [

                  Text(
                    "Version $version",

                    style:
                        const TextStyle(
                      fontSize: 13,
                      fontWeight:
                          FontWeight.w600,
                    ),
                  ),

                  const SizedBox(
                    height: 2,
                  ),

                  Text(
                    "$user • $date",

                    style:
                        const TextStyle(
                      fontSize: 11,
                      color:
                          Colors.grey,
                    ),

                    overflow:
                        TextOverflow
                            .ellipsis,
                  ),
                ],
              ),
            ),

            const Icon(
              Icons.chevron_right,
              size: 20,
              color:
                  Colors.grey,
            ),
          ],
        ),
      ),
    );
  }


  Widget buildHistorySection() {

    return Column(
      crossAxisAlignment:
          CrossAxisAlignment.start,

      children: [

        const Divider(),

        const SizedBox(
          height: 10,
        ),

        const Text(
          "Version History",

          style:
              TextStyle(
            fontSize: 14,
            fontWeight:
                FontWeight.bold,
          ),
        ),

        const SizedBox(
          height: 6,
        ),

        if (isLoadingHistory)

          const Padding(
            padding:
                EdgeInsets.symmetric(
              vertical: 20,
            ),

            child:
                Center(
              child:
                  CircularProgressIndicator(),
            ),
          )

        else if (versions.isEmpty)

          const Padding(
            padding:
                EdgeInsets.symmetric(
              vertical: 20,
            ),

            child:
                Center(
              child:
                  Text(
                "No version history available.",

                style:
                    TextStyle(
                  fontSize: 12,
                  color:
                      Colors.grey,
                ),
              ),
            ),
          )

        else ...[

          ...versions.map(
            (item) =>
                buildHistoryItem(
              item,
            ),
          ),

          const SizedBox(
            height: 8,
          ),

          SizedBox(
            width:
                double.infinity,

            child:
                OutlinedButton.icon(

              onPressed:
                  showAddNewVersionDialog,

              icon:
                  const Icon(
                Icons.add,
                size: 18,
              ),

              label:
                  const Text(
                "Add New Version",
              ),

              style:
                  OutlinedButton.styleFrom(
                foregroundColor:
                    const Color(
                  0xFF00796B,
                ),

                side:
                    const BorderSide(
                  color:
                      Color(
                    0xFF00796B,
                  ),
                ),

                shape:
                    RoundedRectangleBorder(
                  borderRadius:
                      BorderRadius.circular(
                    10,
                  ),
                ),

                padding:
                    const EdgeInsets
                        .symmetric(
                  vertical: 12,
                ),
              ),
            ),
          ),
        ],
      ],
    );
  }

  Widget buildStatusChip() {

    final status =
        document["statusName"] ??
            "Active";

    final isArchived =
        status
            .toString()
            .toLowerCase() ==
        "archived";

    return Container(

      padding:
          const EdgeInsets
              .symmetric(
        horizontal: 9,
        vertical: 5,
      ),

      decoration:
          BoxDecoration(
        color:
            isArchived
                ? Colors.orange.shade100
                : Colors.blue.shade100,

        borderRadius:
            BorderRadius.circular(
          20,
        ),
      ),

      child:
          Text(
        status.toString(),

        style:
            TextStyle(
          fontSize: 11,
          fontWeight:
              FontWeight.w500,

          color:
              isArchived
                  ? Colors.orange.shade800
                  : Colors.blue.shade800,
        ),
      ),
    );
  }


  Widget buildVersionChip() {

    return Container(

      padding:
          const EdgeInsets
              .symmetric(
        horizontal: 9,
        vertical: 5,
      ),

      decoration:
          BoxDecoration(
        color:
            Colors.grey.shade100,

        borderRadius:
            BorderRadius.circular(
          20,
        ),
      ),

      child:
          Text(
        "V ${document["versionNum"] ?? 1}",

        style:
            const TextStyle(
          fontSize: 11,
        ),
      ),
    );
  }


  // ==========================================================
  // PREVIEW
  // ==========================================================

  Widget buildDocumentPreview() {

    if (isLoadingPreview) {

      return const Center(
        child:
            CircularProgressIndicator(),
      );
    }


    final type =
        previewType
            ?.toLowerCase() ??
        "";


    // IMAGE

    if (type == "image" &&
        previewUrl != null) {

      return Container(

        width:
            double.infinity,

        height:
            double.infinity,

        color:
            Colors.white,

        padding:
            const EdgeInsets.only(
          top: 2,
          left: 12,
          right: 12,
          bottom: 105,
        ),

        child:
            InteractiveViewer(

          minScale:
              0.5,

          maxScale:
              4,

          child:
              Image.network(

            previewUrl!,

            headers:
                HttpService
                    .authorizationHeaders,

            fit:
                BoxFit.contain,

            width:
                double.infinity,

            height:
                double.infinity,

            loadingBuilder:
                (
              context,
              child,
              loadingProgress,
            ) {

              if (loadingProgress ==
                  null) {

                return child;
              }

              return const Center(
                child:
                    CircularProgressIndicator(),
              );
            },

            errorBuilder:
                (
              context,
              error,
              stackTrace,
            ) {

              debugPrint(
                "IMAGE PREVIEW FAILED: "
                "$error",
              );

              return const Center(
                child:
                    Column(
                  mainAxisSize:
                      MainAxisSize.min,

                  children: [

                    Icon(
                      Icons
                          .broken_image_outlined,

                      size: 50,

                      color:
                          Colors.grey,
                    ),

                    SizedBox(
                      height: 10,
                    ),

                    Text(
                      "Unable to preview image",

                      style:
                          TextStyle(
                        color:
                            Colors.grey,
                      ),
                    ),
                  ],
                ),
              );
            },
          ),
        ),
      );
    }


    // PDF

    if (type == "pdf") {

      if (pdfBytes == null ||
          pdfBytes!.isEmpty) {

        return const Center(
          child:
              Text(
            "PDF preview is not available",
          ),
        );
      }

      return SfPdfViewer.memory(
        pdfBytes!,
      );
    }


    return const Center(
      child:
          Text(
        "Preview not supported",
      ),
    );
  }

  Widget buildExportingOverlay() {

    final format =
        exportingFormat ??
            "document";

    return Positioned.fill(

      child:
          ColoredBox(

        color:
            Colors.black45,

        child:
            Center(

          child:
              Container(

            width:
                300,

            margin:
                const EdgeInsets.all(
              24,
            ),

            padding:
                const EdgeInsets.fromLTRB(
              28,
              30,
              28,
              26,
            ),

            decoration:
                BoxDecoration(
              color:
                  Colors.white,

              borderRadius:
                  BorderRadius.circular(
                16,
              ),

              boxShadow:
                  const [
                BoxShadow(
                  color:
                      Colors.black26,
                  blurRadius:
                      24,
                ),
              ],
            ),

            child:
                Column(
              mainAxisSize:
                  MainAxisSize.min,

              children: [

                const SizedBox(
                  width: 58,
                  height: 58,

                  child:
                      CircularProgressIndicator(
                    strokeWidth: 4,
                    color:
                        Color(
                      0xFF00796B,
                    ),
                  ),
                ),

                const SizedBox(
                  height: 22,
                ),

                const Text(
                  "Converting...",

                  style:
                      TextStyle(
                    fontSize: 24,
                    fontWeight:
                        FontWeight.w700,
                  ),
                ),

                const SizedBox(
                  height: 10,
                ),

                Text(
                  "Preparing your $format file. "
                  "This should only take a few seconds.",

                  textAlign:
                      TextAlign.center,

                  style:
                      const TextStyle(
                    fontSize: 14,
                    height: 1.45,
                    color:
                        Color(
                      0xFF3E4946,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  @override
  Widget build(
    BuildContext context,
  ) {

    final screenHeight =
        MediaQuery.of(context)
            .size
            .height;

    final maxSheetHeight =
        screenHeight * 0.72;

    final expandedHeight =
        _expandedSheetHeight >
                maxSheetHeight
            ? maxSheetHeight
            : _expandedSheetHeight;

    final sheetHeight =
        isExpanded
            ? expandedHeight
            : _collapsedSheetHeight;


    return Scaffold(

      backgroundColor:
          Colors.grey.shade100,

      appBar:
          AppBar(

        title:
            const Text(
          "Document Preview",

          style:
              TextStyle(
            fontWeight:
                FontWeight.bold,

            fontSize:
                18,
          ),
        ),

        actions: [

          IconButton(
            onPressed:
                downloadDocument,

            icon:
                const Icon(
              Icons.download,
            ),
          ),

          IconButton(
            onPressed:
                shareDocument,

            icon:
                const Icon(
              Icons.share,
            ),
          ),
        ],
      ),


      body:
          Stack(

        children: [

          // DOCUMENT
          Positioned.fill(
            child:
                buildDocumentPreview(),
          ),

          // BOTTOM SHEET
          AnimatedPositioned(

            duration:
                const Duration(
              milliseconds: 250,
            ),

            curve:
                Curves.easeOut,

            left:
                0,

            right:
                0,

            bottom:
                0,

            height:
                sheetHeight,

            child:
                GestureDetector(

              behavior:
                  HitTestBehavior.opaque,

              onTap:
                  toggleSheet,

              onVerticalDragUpdate:
                  _onVerticalDragUpdate,

              onVerticalDragEnd:
                  _onVerticalDragEnd,

              child:
                  Container(

                decoration:
                    const BoxDecoration(

                  color:
                      Colors.white,

                  borderRadius:
                      BorderRadius.vertical(
                    top:
                        Radius.circular(
                      26,
                    ),
                  ),

                  boxShadow:
                      [
                    BoxShadow(
                      blurRadius:
                          15,

                      color:
                          Colors.black12,
                    ),
                  ],
                ),

                child:
                    Column(

                  children: [

                    // HANDLE
                    Padding(
                      padding:
                          const EdgeInsets
                              .only(
                        top: 8,
                        bottom: 8,
                      ),

                      child:
                          Column(
                        children: [

                          Container(
                            width: 42,
                            height: 5,

                            decoration:
                                BoxDecoration(
                              color:
                                  Colors.grey
                                      .shade400,

                              borderRadius:
                                  BorderRadius
                                      .circular(
                                10,
                              ),
                            ),
                          ),

                          const SizedBox(
                            height: 6,
                          ),

                          Text(
                            isExpanded
                                ? "Document Details"
                                : "Swipe up for details",

                            style:
                                const TextStyle(
                              fontSize: 11,
                              color:
                                  Colors.grey,
                            ),
                          ),
                        ],
                      ),
                    ),

                    // DETAILS
                    Expanded(

                      child:
                          SingleChildScrollView(

                        padding:
                            const EdgeInsets
                                .fromLTRB(
                          16,
                          4,
                          16,
                          20,
                        ),

                        child:
                            Column(

                          crossAxisAlignment:
                              CrossAxisAlignment
                                  .start,

                          children: [

                            Text(
                              document[
                                      "documentName"] ??
                                  "Unknown",

                              maxLines:
                                  2,

                              overflow:
                                  TextOverflow
                                      .ellipsis,

                              style:
                                  const TextStyle(
                                fontSize: 18,
                                fontWeight:
                                    FontWeight.bold,
                              ),
                            ),

                            const SizedBox(
                              height: 4,
                            ),

                            Text(
                              document[
                                      "departmentName"] ??
                                  "",

                              style:
                                  const TextStyle(
                                fontSize: 12,
                                color:
                                    Colors.grey,
                              ),
                            ),

                            const SizedBox(
                              height: 12,
                            ),

                            Row(
                              children: [

                                buildStatusChip(),

                                const SizedBox(
                                  width: 8,
                                ),

                                buildVersionChip(),
                              ],
                            ),

                            const SizedBox(
                              height: 18,
                            ),

                            buildActionSection(),

                            const SizedBox(
                              height: 10,
                            ),

                            buildAISummarySection(),

                            const SizedBox(
                              height: 20,
                            ),

                            buildHistorySection(),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),

          if (exportingFormat != null)
            buildExportingOverlay(),
        ],
      ),
    );
  }
}