import 'dart:typed_data';

import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:syncfusion_flutter_pdfviewer/pdfviewer.dart';

import '../api/document_api.dart';
import '../api/http_service.dart';

class VersionPreview extends StatefulWidget {
  final Map<String, dynamic> document;
  final Map<String, dynamic> version;

  const VersionPreview({
    super.key,
    required this.document,
    required this.version,
  });

  @override
  State<VersionPreview> createState() =>
      _VersionPreviewState();
}

class _VersionPreviewState extends State<VersionPreview> {
  bool isLoading = true;
  bool isChangingVersion = false;

  Uint8List? pdfBytes;

  String? previewUrl;
  String? previewType;
  String? errorMessage;

  late dynamic versionNumber;

  @override
  void initState() {
    super.initState();

    versionNumber =
        widget.version["versionNum"] ??
        widget.version["version"] ??
        1;

    loadPreview();
  }

  Future<void> loadPreview() async {
    if (!mounted) {
      return;
    }

    setState(() {
      isLoading = true;
      errorMessage = null;
      pdfBytes = null;
      previewUrl = null;
      previewType = null;
    });

    try {
      debugPrint( "================================",);
      debugPrint( "VERSION PREVIEW",);
      debugPrint(
        "DOCUMENT ID: "
        "${widget.document["documentID"]}",
      );
      debugPrint(
        "VERSION NUMBER: "
        "$versionNumber",
      );

      debugPrint(
        "VERSION DATA: "
        "${widget.version}",
      );
      debugPrint( "================================",);

      final fileUrl =
          widget.version["fileUrl"] ??
          widget.version["filePath"] ??
          widget.version["path"] ??
          widget.version["file"];

      if (fileUrl == null ||
          fileUrl.toString().trim().isEmpty) {
        throw Exception(
          "File is not available.",
        );
      }

      final file =
          fileUrl.toString().trim();

      final lower =
          file.toLowerCase().split("?").first;

      debugPrint(
        "VERSION FILE URL: $file",
      );

      debugPrint(
        "VERSION FILE TYPE: $lower",
      );

      if (_isImage(lower)) {
        final fullUrl =
            file.startsWith("http")
                ? file
                : HttpService.getFileUrl(file);

        debugPrint(
          "IMAGE URL: $fullUrl",
        );

        if (!mounted) {
          return;
        }

        setState(() {
          previewUrl = fullUrl;
          previewType = "image";
          isLoading = false;
        });

        return;
      }

      if (lower.endsWith(".pdf")) {
        debugPrint(
          "VERSION IS PDF",
        );

        await loadPdf(file);

        return;
      }

      if (_isOffice(lower)) {
        debugPrint(
          "VERSION IS OFFICE FILE",
        );

        debugPrint(
          "Converting version to PDF...",
        );

        final documentId =
            widget.document["documentID"];

        if (documentId == null) {
          throw Exception(
            "Document ID is missing.",
          );
        }

        final exportResponse =
            await DocumentApi.exportPDF(
          documentId.toString(),
        );

        debugPrint(
          "VERSION EXPORT RESPONSE: "
          "$exportResponse",
        );

        if (exportResponse == null) {
          throw Exception(
            "PDF conversion failed.",
          );
        }

        if (exportResponse["success"] == false) {
          throw Exception(
            exportResponse["message"] ??
                "PDF conversion failed.",
          );
        }

        final downloadUrl =
            exportResponse["downloadUrl"]
                ?.toString();

        debugPrint(
          "CONVERTED PDF URL: "
          "$downloadUrl",
        );

        if (downloadUrl == null ||
            downloadUrl.isEmpty) {
          throw Exception(
            "No downloadUrl returned.",
          );
        }

        await loadPdf(downloadUrl);

        return;
      }

      throw Exception(
        "Preview is not available for this file type.",
      );
    } catch (e, stackTrace) {
      debugPrint( "================================", );
      debugPrint("VERSION PREVIEW FAILED",);
      debugPrint("ERROR: $e",);
      debugPrint("STACK TRACE: $stackTrace",);
      debugPrint( "================================", );

      if (!mounted) { return;}

      setState(() {
        isLoading = false;
        errorMessage = e.toString();
      });
    }
  }

  Future<void> loadPdf(String fileUrl) async {
    final url = HttpService.getFileUrl(fileUrl);

    debugPrint("===============================");
    debugPrint("VERSION PDF");
    debugPrint("FILE PATH: $fileUrl");
    debugPrint("PDF URL: $url");
    debugPrint("===============================");

    final response = await http.get(
      Uri.parse(url),
      headers: HttpService.authorizationHeaders,
    );

    debugPrint("PDF STATUS: ${response.statusCode}");
    debugPrint("PDF CONTENT TYPE: ${response.headers['content-type']}");
    debugPrint("PDF SIZE: ${response.bodyBytes.length}");

    if (response.statusCode != 200) {
      throw Exception(
        "Failed to load document. HTTP ${response.statusCode}",
      );
    }

    if (response.bodyBytes.isEmpty) {
      throw Exception("Document is empty.");
    }

    if (!mounted) return;

    setState(() {
      pdfBytes = response.bodyBytes;
      previewUrl = url;
      previewType = "pdf";
      isLoading = false;
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

  Future<void> makeCurrentVersion() async {
    if (isChangingVersion) {
      return;
    }

    final version =
        int.tryParse(
              versionNumber.toString(),
            ) ??
            1;

    final confirmed =
        await showDialog<bool>(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text(
            "Use this version?",
          ),
          content: Text(
            "Version $version will become "
            "the current version.",
          ),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.pop(
                  context,
                  false,
                );
              },
              child: const Text(
                "Cancel",
              ),
            ),
            ElevatedButton(
              onPressed: () {
                Navigator.pop(
                  context,
                  true,
                );
              },
              style:
                  ElevatedButton.styleFrom(
                backgroundColor:
                    const Color(
                  0xFF00685f,
                ),
                foregroundColor:
                    Colors.white,
              ),
              child: const Text(
                "Make Current",
              ),
            ),
          ],
        );
      },
    );

    if (confirmed != true) {
      return;
    }

    try {
      if (!mounted) {
        return;
      }

      setState(() {
        isChangingVersion = true;
      });

      final documentId =
          widget.document["documentID"];

      if (documentId == null) {
        throw Exception(
          "Document ID is missing.",
        );
      }

      debugPrint(
        "MAKE CURRENT VERSION",
      );

      debugPrint(
        "DOCUMENT ID: $documentId",
      );

      debugPrint(
        "VERSION: $version",
      );

      final response =
          await DocumentApi.updateDocumentVersion(
        documentId.toString(),
        version,
      );

      debugPrint(
        "MAKE CURRENT RESPONSE: "
        "$response",
      );

      if (!mounted) { return; }

      if (response == null ||
          (response is Map &&
              response["success"] ==
                  false)) {
        throw Exception(
          response?["message"] ??
              "Failed to change version.",
        );
      }

      Navigator.pop(
        context,
        true,
      );
    } catch (e) {
      debugPrint(
        "MAKE CURRENT FAILED: $e",
      );

      if (!mounted) {
        return;
      }

      setState(() {
        isChangingVersion = false;
      });

      ScaffoldMessenger.of(context)
          .showSnackBar(
        SnackBar(
          content: Text(
            "Failed to change version: $e",
          ),
        ),
      );
    }
  }

  Widget buildPreview() {
    if (isLoading) {
      return const Center(
        child:
            CircularProgressIndicator(),
      );
    }

    if (errorMessage != null) {
      return Center(
        child: Padding(
          padding:
              const EdgeInsets.all(30),
          child: Column(
            mainAxisSize:
                MainAxisSize.min,
            children: [
              const Icon(
                Icons.error_outline,
                size: 45,
                color: Colors.grey,
              ),

              const SizedBox(
                height: 12,
              ),

              const Text(
                "Unable to preview this version",
                style: TextStyle(
                  fontWeight:
                      FontWeight.w600,
                ),
              ),

              const SizedBox(
                height: 8,
              ),

              Text(
                errorMessage!,
                textAlign:
                    TextAlign.center,
                style: const TextStyle(
                  fontSize: 11,
                  color: Colors.grey,
                ),
              ),

              const SizedBox(
                height: 15,
              ),

              OutlinedButton.icon(
                onPressed:
                    loadPreview,
                icon:
                    const Icon(
                  Icons.refresh,
                ),
                label:
                    const Text(
                  "Retry",
                ),
              ),
            ],
          ),
        ),
      );
    }

    if (previewType == "pdf" &&
        pdfBytes != null &&
        pdfBytes!.isNotEmpty) {
      return SfPdfViewer.memory(
        pdfBytes!,
      );
    }

    if (previewType == "image" &&
        previewUrl != null) {
      return InteractiveViewer(
        minScale: 0.5,
        maxScale: 4,
        child: Image.network(
          previewUrl!,
          headers:
              HttpService
                  .authorizationHeaders,
          fit: BoxFit.contain,
          errorBuilder:
              (
            context,
            error,
            stackTrace,
          ) {
            return const Center(
              child: Text(
                "Unable to preview image",
              ),
            );
          },
        ),
      );
    }

    return const Center(
      child: Text(
        "Preview not supported",
      ),
    );
  }

  @override
  Widget build(
    BuildContext context,
  ) {
    return Dialog(
      insetPadding:
          const EdgeInsets.symmetric(
        horizontal: 18,
        vertical: 30,
      ),

      shape:
          RoundedRectangleBorder(
        borderRadius:
            BorderRadius.circular(20),
      ),

      child: SizedBox(
        width:
            double.infinity,

        height:
            MediaQuery.of(context)
                    .size
                    .height *
                0.85,

        child: Column(
          children: [
            Padding(
              padding:
                  const EdgeInsets.fromLTRB(
                18,
                14,
                8,
                12,
              ),

              child: Row(
                children: [
                  Container(
                    width: 38,
                    height: 38,

                    decoration:
                        BoxDecoration(
                      color:
                          Colors.teal.shade50,

                      borderRadius:
                          BorderRadius
                              .circular(
                        10,
                      ),
                    ),

                    child:
                        const Icon(
                      Icons.history,

                      color:
                          Color(
                        0xFF00685f,
                      ),
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
                          "Version $versionNumber",

                          style:
                              const TextStyle(
                            fontSize: 16,
                            fontWeight:
                                FontWeight
                                    .bold,
                          ),
                        ),

                        const SizedBox(
                          height: 2,
                        ),

                        Text(
                          widget.document[
                                  "documentName"] ??
                              "Document",

                          maxLines: 1,

                          overflow:
                              TextOverflow
                                  .ellipsis,

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

                  IconButton(
                    onPressed: () {
                      Navigator.pop(
                        context,
                      );
                    },

                    icon:
                        const Icon(
                      Icons.close,
                    ),
                  ),
                ],
              ),
            ),

            const Divider(
              height: 1,
            ),

            Expanded(
              child:
                  Container(
                color:
                    Colors.grey.shade100,

                child:
                    buildPreview(),
              ),
            ),

            Container(
              padding:
                  const EdgeInsets.fromLTRB(
                18,
                12,
                18,
                16,
              ),

              color:
                  Colors.white,

              child:
                  Column(
                children: [
                  Row(
                    children: [
                      const Icon(
                        Icons.info_outline,
                        size: 16,
                        color:
                            Colors.grey,
                      ),

                      const SizedBox(
                        width: 6,
                      ),

                      Expanded(
                        child:
                            Text(
                          "Version $versionNumber • "
                          "${widget.version["uploadedBy"] ??
                              widget.version["updatedBy"] ??
                              "Admin"}",

                          style:
                              const TextStyle(
                            fontSize: 11,
                            color:
                                Colors.grey,
                          ),
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(
                    height: 10,
                  ),

                  SizedBox(
                    width:
                        double.infinity,

                    child:
                        ElevatedButton
                            .icon(
                      onPressed:
                          isChangingVersion
                              ? null
                              : makeCurrentVersion,

                      icon:
                          isChangingVersion
                              ? const SizedBox(
                                  width: 17,
                                  height: 17,

                                  child:
                                      CircularProgressIndicator(
                                    strokeWidth:
                                        2,

                                    color:
                                        Colors.white,
                                  ),
                                )
                              : const Icon(
                                  Icons
                                      .swap_horiz,
                                ),

                      label:
                          Text(
                        isChangingVersion
                            ? "Changing..."
                            : "Make This Current Version",
                      ),

                      style:
                          ElevatedButton
                              .styleFrom(
                        backgroundColor:
                            const Color(
                          0xFF00685f,
                        ),

                        foregroundColor:
                            Colors.white,

                        padding:
                            const EdgeInsets
                                .symmetric(
                          vertical: 13,
                        ),

                        shape:
                            RoundedRectangleBorder(
                          borderRadius:
                              BorderRadius
                                  .circular(
                            10,
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}