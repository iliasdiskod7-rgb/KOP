using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace KOP.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "REF_ALE",
                columns: table => new
                {
                    ID = table.Column<int>(type: "NUMBER(10)", nullable: false)
                        .Annotation("Oracle:Identity", "START WITH 1 INCREMENT BY 1"),
                    KODIKOS = table.Column<string>(type: "NVARCHAR2(10)", maxLength: 10, nullable: false),
                    PERIGRAFI = table.Column<string>(type: "NVARCHAR2(200)", maxLength: 200, nullable: false),
                    KATIGORIA = table.Column<string>(type: "NVARCHAR2(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_REF_ALE", x => x.ID);
                });

            migrationBuilder.CreateTable(
                name: "REF_KATIGORIES_PTITIKON_MESON",
                columns: table => new
                {
                    ID = table.Column<int>(type: "NUMBER(10)", nullable: false)
                        .Annotation("Oracle:Identity", "START WITH 1 INCREMENT BY 1"),
                    ONOMASIA = table.Column<string>(type: "NVARCHAR2(200)", maxLength: 200, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_REF_KATIGORIES_PTITIKON_MESON", x => x.ID);
                });

            migrationBuilder.CreateTable(
                name: "REF_KYRIA_STOIXEIA",
                columns: table => new
                {
                    ID = table.Column<int>(type: "NUMBER(10)", nullable: false)
                        .Annotation("Oracle:Identity", "START WITH 1 INCREMENT BY 1"),
                    ONOMASIA = table.Column<string>(type: "NVARCHAR2(200)", maxLength: 200, nullable: false),
                    PERIGRAFI = table.Column<string>(type: "NVARCHAR2(1000)", maxLength: 1000, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_REF_KYRIA_STOIXEIA", x => x.ID);
                });

            migrationBuilder.CreateTable(
                name: "REF_ORGANIZATIONAL_UNITS",
                columns: table => new
                {
                    ID = table.Column<int>(type: "NUMBER(10)", nullable: false)
                        .Annotation("Oracle:Identity", "START WITH 1 INCREMENT BY 1"),
                    HSTR_ID = table.Column<int>(type: "NUMBER(10)", nullable: false),
                    ONOMASIA = table.Column<string>(type: "NVARCHAR2(200)", maxLength: 200, nullable: false),
                    UNIT_TYPE = table.Column<string>(type: "NVARCHAR2(50)", maxLength: 50, nullable: false),
                    PARENT_ID = table.Column<int>(type: "NUMBER(10)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_REF_ORGANIZATIONAL_UNITS", x => x.ID);
                    table.ForeignKey(
                        name: "FK_REF_ORGANIZATIONAL_UNITS_REF_ORGANIZATIONAL_UNITS_PARENT_ID",
                        column: x => x.PARENT_ID,
                        principalTable: "REF_ORGANIZATIONAL_UNITS",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "REF_TYPOI_PTITIKON_MESON",
                columns: table => new
                {
                    ID = table.Column<int>(type: "NUMBER(10)", nullable: false)
                        .Annotation("Oracle:Identity", "START WITH 1 INCREMENT BY 1"),
                    ONOMASIA = table.Column<string>(type: "NVARCHAR2(200)", maxLength: 200, nullable: false),
                    KATIGORIA_PTITIKOU_MESOU_ID = table.Column<int>(type: "NUMBER(10)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_REF_TYPOI_PTITIKON_MESON", x => x.ID);
                    table.ForeignKey(
                        name: "FK_REF_TYPOI_PTITIKON_MESON_REF_KATIGORIES_PTITIKON_MESON_KATIGORIA_PTITIKOU_MESOU_ID",
                        column: x => x.KATIGORIA_PTITIKOU_MESOU_ID,
                        principalTable: "REF_KATIGORIES_PTITIKON_MESON",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "REF_STOIXEIA_KOSTOUS",
                columns: table => new
                {
                    ID = table.Column<int>(type: "NUMBER(10)", nullable: false)
                        .Annotation("Oracle:Identity", "START WITH 1 INCREMENT BY 1"),
                    KODIKOS = table.Column<string>(type: "NVARCHAR2(100)", maxLength: 100, nullable: false),
                    EPIPEDO_ANALYSIS = table.Column<int>(type: "NUMBER(10)", nullable: false),
                    ONOMASIA = table.Column<string>(type: "NVARCHAR2(200)", maxLength: 200, nullable: false),
                    EINAI_XAMILOTERO_EPIPEDO = table.Column<bool>(type: "NUMBER(1)", nullable: false),
                    KYRIO_STOIXEIO_ID = table.Column<int>(type: "NUMBER(10)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_REF_STOIXEIA_KOSTOUS", x => x.ID);
                    table.ForeignKey(
                        name: "FK_REF_STOIXEIA_KOSTOUS_REF_KYRIA_STOIXEIA_KYRIO_STOIXEIO_ID",
                        column: x => x.KYRIO_STOIXEIO_ID,
                        principalTable: "REF_KYRIA_STOIXEIA",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "REF_YPODEIGMATA",
                columns: table => new
                {
                    ID = table.Column<int>(type: "NUMBER(10)", nullable: false)
                        .Annotation("Oracle:Identity", "START WITH 1 INCREMENT BY 1"),
                    TITLE = table.Column<string>(type: "NVARCHAR2(200)", maxLength: 200, nullable: false),
                    PERIGRAFI = table.Column<string>(type: "NVARCHAR2(1000)", maxLength: 1000, nullable: true),
                    YPODEIGMA_TYPE = table.Column<string>(type: "NVARCHAR2(50)", maxLength: 50, nullable: false),
                    IS_ACTIVE = table.Column<bool>(type: "NUMBER(1)", nullable: false),
                    KYRIO_STOIXEIO_ID = table.Column<int>(type: "NUMBER(10)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_REF_YPODEIGMATA", x => x.ID);
                    table.ForeignKey(
                        name: "FK_REF_YPODEIGMATA_REF_KYRIA_STOIXEIA_KYRIO_STOIXEIO_ID",
                        column: x => x.KYRIO_STOIXEIO_ID,
                        principalTable: "REF_KYRIA_STOIXEIA",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "SEC_USERS",
                columns: table => new
                {
                    ID = table.Column<int>(type: "NUMBER(10)", nullable: false)
                        .Annotation("Oracle:Identity", "START WITH 1 INCREMENT BY 1"),
                    EXTERNAL_ID = table.Column<int>(type: "NUMBER(10)", nullable: false),
                    VATHMOS = table.Column<string>(type: "NVARCHAR2(50)", maxLength: 50, nullable: false),
                    EIDIKOTITA = table.Column<string>(type: "NVARCHAR2(50)", maxLength: 50, nullable: false),
                    ONOMA = table.Column<string>(type: "NVARCHAR2(100)", maxLength: 100, nullable: false),
                    EPONYMO = table.Column<string>(type: "NVARCHAR2(100)", maxLength: 100, nullable: false),
                    AMA = table.Column<string>(type: "NVARCHAR2(50)", maxLength: 50, nullable: false),
                    EPISTASIA = table.Column<string>(type: "NVARCHAR2(100)", maxLength: 100, nullable: false),
                    PHONE_NUMBER = table.Column<string>(type: "NVARCHAR2(50)", maxLength: 50, nullable: true),
                    IS_ACTIVE = table.Column<bool>(type: "NUMBER(1)", nullable: false),
                    ORG_UNIT_ID = table.Column<int>(type: "NUMBER(10)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SEC_USERS", x => x.ID);
                    table.ForeignKey(
                        name: "FK_SEC_USERS_REF_ORGANIZATIONAL_UNITS_ORG_UNIT_ID",
                        column: x => x.ORG_UNIT_ID,
                        principalTable: "REF_ORGANIZATIONAL_UNITS",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "REF_TYPOI_PTITIKON_MESON_ORG_UNITS",
                columns: table => new
                {
                    TYPOS_PTITIKOU_MESOU_ID = table.Column<int>(type: "NUMBER(10)", nullable: false),
                    ORG_UNIT_ID = table.Column<int>(type: "NUMBER(10)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_REF_TYPOI_PTITIKON_MESON_ORG_UNITS", x => new { x.TYPOS_PTITIKOU_MESOU_ID, x.ORG_UNIT_ID });
                    table.ForeignKey(
                        name: "FK_REF_TYPOI_PTITIKON_MESON_ORG_UNITS_REF_ORGANIZATIONAL_UNITS_ORG_UNIT_ID",
                        column: x => x.ORG_UNIT_ID,
                        principalTable: "REF_ORGANIZATIONAL_UNITS",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_REF_TYPOI_PTITIKON_MESON_ORG_UNITS_REF_TYPOI_PTITIKON_MESON_TYPOS_PTITIKOU_MESOU_ID",
                        column: x => x.TYPOS_PTITIKOU_MESOU_ID,
                        principalTable: "REF_TYPOI_PTITIKON_MESON",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "CALC_ST1_MIKTES_APODOXES_ANA_ETOS_ORG_UNIT_STOIXEIO_KOSTOUS",
                columns: table => new
                {
                    ETOS_ANAFORAS = table.Column<int>(type: "NUMBER(10)", nullable: false),
                    ORG_UNIT_ID = table.Column<int>(type: "NUMBER(10)", nullable: false),
                    STOIXEIO_KOSTOUS_ID = table.Column<int>(type: "NUMBER(10)", nullable: false),
                    VALUE = table.Column<decimal>(type: "DECIMAL(18,2)", precision: 18, scale: 2, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CALC_ST1_MIKTES_APODOXES_ANA_ETOS_ORG_UNIT_STOIXEIO_KOSTOUS", x => new { x.ETOS_ANAFORAS, x.ORG_UNIT_ID, x.STOIXEIO_KOSTOUS_ID });
                    table.ForeignKey(
                        name: "FK_CALC_ST1_MIKTES_APODOXES_ANA_ETOS_ORG_UNIT_STOIXEIO_KOSTOUS_REF_ORGANIZATIONAL_UNITS_ORG_UNIT_ID",
                        column: x => x.ORG_UNIT_ID,
                        principalTable: "REF_ORGANIZATIONAL_UNITS",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CALC_ST1_MIKTES_APODOXES_ANA_ETOS_ORG_UNIT_STOIXEIO_KOSTOUS_REF_STOIXEIA_KOSTOUS_STOIXEIO_KOSTOUS_ID",
                        column: x => x.STOIXEIO_KOSTOUS_ID,
                        principalTable: "REF_STOIXEIA_KOSTOUS",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "INP_ST1_TOPOTHETISEIS_PROSOPIKOU",
                columns: table => new
                {
                    ID = table.Column<int>(type: "NUMBER(10)", nullable: false)
                        .Annotation("Oracle:Identity", "START WITH 1 INCREMENT BY 1"),
                    PEBADA_ID = table.Column<int>(type: "NUMBER(10)", nullable: false),
                    RANK = table.Column<string>(type: "NVARCHAR2(50)", maxLength: 50, nullable: false),
                    EIDIK = table.Column<string>(type: "NVARCHAR2(50)", maxLength: 50, nullable: false),
                    ONOMA = table.Column<string>(type: "NVARCHAR2(100)", maxLength: 100, nullable: false),
                    EPONYMO = table.Column<string>(type: "NVARCHAR2(100)", maxLength: 100, nullable: false),
                    AMA = table.Column<string>(type: "NVARCHAR2(50)", maxLength: 50, nullable: false),
                    HSTR_ID = table.Column<int>(type: "NUMBER(10)", nullable: false),
                    HSTR_TITLE = table.Column<string>(type: "NVARCHAR2(200)", maxLength: 200, nullable: false),
                    HSTR_ID_MONADAS = table.Column<int>(type: "NUMBER(10)", nullable: false),
                    HSTR_TITLE_MONADAS = table.Column<string>(type: "NVARCHAR2(200)", maxLength: 200, nullable: false),
                    DATE_PAROUSIASIS_ETOUS = table.Column<DateTime>(type: "DATE", nullable: false),
                    DATE_DIAGRAFIS_ETOUS = table.Column<DateTime>(type: "DATE", nullable: false),
                    IMERES = table.Column<int>(type: "NUMBER(10)", nullable: false),
                    EINAI_APOSPASI = table.Column<bool>(type: "NUMBER(1)", nullable: false),
                    APOSPASI_SE_HSTR_ID = table.Column<int>(type: "NUMBER(10)", nullable: true),
                    APOSPASI_SE_HSTR_TITLE = table.Column<string>(type: "NVARCHAR2(200)", maxLength: 200, nullable: true),
                    EXEI_APOSPASEIS_STO_DIASTIMA_TOPOTHETISIS = table.Column<bool>(type: "NUMBER(1)", nullable: false),
                    ETOS_ANAFORAS = table.Column<int>(type: "NUMBER(10)", nullable: false),
                    ORG_UNIT_ID = table.Column<int>(type: "NUMBER(10)", nullable: false),
                    STOIXEIO_KOSTOUS_ID = table.Column<int>(type: "NUMBER(10)", nullable: false),
                    SYNOLO_MIKTON_APODOXON_STELEXOUS_STIS_IMERES = table.Column<decimal>(type: "DECIMAL(18,2)", precision: 18, scale: 2, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_INP_ST1_TOPOTHETISEIS_PROSOPIKOU", x => x.ID);
                    table.ForeignKey(
                        name: "FK_INP_ST1_TOPOTHETISEIS_PROSOPIKOU_REF_ORGANIZATIONAL_UNITS_ORG_UNIT_ID",
                        column: x => x.ORG_UNIT_ID,
                        principalTable: "REF_ORGANIZATIONAL_UNITS",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_INP_ST1_TOPOTHETISEIS_PROSOPIKOU_REF_STOIXEIA_KOSTOUS_STOIXEIO_KOSTOUS_ID",
                        column: x => x.STOIXEIO_KOSTOUS_ID,
                        principalTable: "REF_STOIXEIA_KOSTOUS",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "REF_YPODEIGMA_SUBMISSION_SCOPES",
                columns: table => new
                {
                    YPODEIGMA_ID = table.Column<int>(type: "NUMBER(10)", nullable: false),
                    RESPONSIBLE_ORG_UNIT_ID = table.Column<int>(type: "NUMBER(10)", nullable: false),
                    SUBJECT_ORG_UNIT_ID = table.Column<int>(type: "NUMBER(10)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_REF_YPODEIGMA_SUBMISSION_SCOPES", x => new { x.YPODEIGMA_ID, x.RESPONSIBLE_ORG_UNIT_ID, x.SUBJECT_ORG_UNIT_ID });
                    table.ForeignKey(
                        name: "FK_REF_YPODEIGMA_SUBMISSION_SCOPES_REF_ORGANIZATIONAL_UNITS_RESPONSIBLE_ORG_UNIT_ID",
                        column: x => x.RESPONSIBLE_ORG_UNIT_ID,
                        principalTable: "REF_ORGANIZATIONAL_UNITS",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_REF_YPODEIGMA_SUBMISSION_SCOPES_REF_ORGANIZATIONAL_UNITS_SUBJECT_ORG_UNIT_ID",
                        column: x => x.SUBJECT_ORG_UNIT_ID,
                        principalTable: "REF_ORGANIZATIONAL_UNITS",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_REF_YPODEIGMA_SUBMISSION_SCOPES_REF_YPODEIGMATA_YPODEIGMA_ID",
                        column: x => x.YPODEIGMA_ID,
                        principalTable: "REF_YPODEIGMATA",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "SEC_ACCESS_GRANTS",
                columns: table => new
                {
                    ID = table.Column<int>(type: "NUMBER(10)", nullable: false)
                        .Annotation("Oracle:Identity", "START WITH 1 INCREMENT BY 1"),
                    GRANTEE_USER_ID = table.Column<int>(type: "NUMBER(10)", nullable: true),
                    GRANTEE_ORG_UNIT_ID = table.Column<int>(type: "NUMBER(10)", nullable: true),
                    YPODEIGMA_ID = table.Column<int>(type: "NUMBER(10)", nullable: false),
                    RESPONSIBLE_ORG_UNIT_ID = table.Column<int>(type: "NUMBER(10)", nullable: false),
                    PERMISSIONS = table.Column<int>(type: "NUMBER(10)", nullable: false),
                    INSERTED_AT = table.Column<DateTime>(type: "TIMESTAMP(3)", precision: 3, nullable: false),
                    INSERTED_BY_USER_ID = table.Column<int>(type: "NUMBER(10)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SEC_ACCESS_GRANTS", x => x.ID);
                    table.CheckConstraint("CK_ACCESS_GRANTS_EXACTLY_ONE_GRANTEE", "(\r\n    (\"GRANTEE_USER_ID\" IS NOT NULL AND \"GRANTEE_ORG_UNIT_ID\" IS NULL)\r\n    OR\r\n    (\"GRANTEE_USER_ID\" IS NULL AND \"GRANTEE_ORG_UNIT_ID\" IS NOT NULL)\r\n)");
                    table.ForeignKey(
                        name: "FK_SEC_ACCESS_GRANTS_REF_ORGANIZATIONAL_UNITS_GRANTEE_ORG_UNIT_ID",
                        column: x => x.GRANTEE_ORG_UNIT_ID,
                        principalTable: "REF_ORGANIZATIONAL_UNITS",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_SEC_ACCESS_GRANTS_REF_ORGANIZATIONAL_UNITS_RESPONSIBLE_ORG_UNIT_ID",
                        column: x => x.RESPONSIBLE_ORG_UNIT_ID,
                        principalTable: "REF_ORGANIZATIONAL_UNITS",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_SEC_ACCESS_GRANTS_REF_YPODEIGMATA_YPODEIGMA_ID",
                        column: x => x.YPODEIGMA_ID,
                        principalTable: "REF_YPODEIGMATA",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_SEC_ACCESS_GRANTS_SEC_USERS_GRANTEE_USER_ID",
                        column: x => x.GRANTEE_USER_ID,
                        principalTable: "SEC_USERS",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_SEC_ACCESS_GRANTS_SEC_USERS_INSERTED_BY_USER_ID",
                        column: x => x.INSERTED_BY_USER_ID,
                        principalTable: "SEC_USERS",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "SEC_USERS_ROLES",
                columns: table => new
                {
                    USER_ID = table.Column<int>(type: "NUMBER(10)", nullable: false),
                    ROLE = table.Column<string>(type: "NVARCHAR2(50)", maxLength: 50, nullable: false),
                    INSERTED_BY_USER_ID = table.Column<int>(type: "NUMBER(10)", nullable: false),
                    INSERTED_AT = table.Column<DateTime>(type: "TIMESTAMP(3)", precision: 3, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SEC_USERS_ROLES", x => new { x.USER_ID, x.ROLE });
                    table.ForeignKey(
                        name: "FK_SEC_USERS_ROLES_SEC_USERS_INSERTED_BY_USER_ID",
                        column: x => x.INSERTED_BY_USER_ID,
                        principalTable: "SEC_USERS",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_SEC_USERS_ROLES_SEC_USERS_USER_ID",
                        column: x => x.USER_ID,
                        principalTable: "SEC_USERS",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "WF_SUBMISSIONS",
                columns: table => new
                {
                    ID = table.Column<int>(type: "NUMBER(10)", nullable: false)
                        .Annotation("Oracle:Identity", "START WITH 1 INCREMENT BY 1"),
                    ETOS_ANAFORAS = table.Column<int>(type: "NUMBER(10)", nullable: false),
                    YPODEIGMA_ID = table.Column<int>(type: "NUMBER(10)", nullable: false),
                    RESPONSIBLE_ORG_UNIT_ID = table.Column<int>(type: "NUMBER(10)", nullable: false),
                    CURRENT_STATUS = table.Column<string>(type: "NVARCHAR2(50)", maxLength: 50, nullable: false),
                    CURRENT_REVISION_NO = table.Column<int>(type: "NUMBER(10)", nullable: false),
                    CREATED_BY_USER_ID = table.Column<int>(type: "NUMBER(10)", nullable: false),
                    CREATED_AT = table.Column<DateTime>(type: "TIMESTAMP(3)", precision: 3, nullable: false),
                    UPDATED_BY_USER_ID = table.Column<int>(type: "NUMBER(10)", nullable: false),
                    UPDATED_AT = table.Column<DateTime>(type: "TIMESTAMP(3)", precision: 3, nullable: false),
                    COMMENT = table.Column<string>(type: "NVARCHAR2(1000)", maxLength: 1000, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WF_SUBMISSIONS", x => x.ID);
                    table.ForeignKey(
                        name: "FK_WF_SUBMISSIONS_REF_ORGANIZATIONAL_UNITS_RESPONSIBLE_ORG_UNIT_ID",
                        column: x => x.RESPONSIBLE_ORG_UNIT_ID,
                        principalTable: "REF_ORGANIZATIONAL_UNITS",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_WF_SUBMISSIONS_REF_YPODEIGMATA_YPODEIGMA_ID",
                        column: x => x.YPODEIGMA_ID,
                        principalTable: "REF_YPODEIGMATA",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_WF_SUBMISSIONS_SEC_USERS_CREATED_BY_USER_ID",
                        column: x => x.CREATED_BY_USER_ID,
                        principalTable: "SEC_USERS",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_WF_SUBMISSIONS_SEC_USERS_UPDATED_BY_USER_ID",
                        column: x => x.UPDATED_BY_USER_ID,
                        principalTable: "SEC_USERS",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "INP_YPODEIGMATA_ENTRIES",
                columns: table => new
                {
                    ID = table.Column<int>(type: "NUMBER(10)", nullable: false)
                        .Annotation("Oracle:Identity", "START WITH 1 INCREMENT BY 1"),
                    SUBMISSION_ID = table.Column<int>(type: "NUMBER(10)", nullable: false),
                    SUBMISSION_REVISION_NO = table.Column<int>(type: "NUMBER(10)", nullable: false),
                    MONADA_ORG_UNIT_ID = table.Column<int>(type: "NUMBER(10)", nullable: false),
                    MOIRA_ORG_UNIT_ID = table.Column<int>(type: "NUMBER(10)", nullable: true),
                    STOIXEIO_KOSTOUS_ID = table.Column<int>(type: "NUMBER(10)", nullable: false),
                    VALUE = table.Column<decimal>(type: "DECIMAL(18,2)", precision: 18, scale: 2, nullable: false),
                    COMMENT = table.Column<string>(type: "NVARCHAR2(1000)", maxLength: 1000, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_INP_YPODEIGMATA_ENTRIES", x => x.ID);
                    table.ForeignKey(
                        name: "FK_INP_YPODEIGMATA_ENTRIES_REF_ORGANIZATIONAL_UNITS_MOIRA_ORG_UNIT_ID",
                        column: x => x.MOIRA_ORG_UNIT_ID,
                        principalTable: "REF_ORGANIZATIONAL_UNITS",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_INP_YPODEIGMATA_ENTRIES_REF_ORGANIZATIONAL_UNITS_MONADA_ORG_UNIT_ID",
                        column: x => x.MONADA_ORG_UNIT_ID,
                        principalTable: "REF_ORGANIZATIONAL_UNITS",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_INP_YPODEIGMATA_ENTRIES_REF_STOIXEIA_KOSTOUS_STOIXEIO_KOSTOUS_ID",
                        column: x => x.STOIXEIO_KOSTOUS_ID,
                        principalTable: "REF_STOIXEIA_KOSTOUS",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_INP_YPODEIGMATA_ENTRIES_WF_SUBMISSIONS_SUBMISSION_ID",
                        column: x => x.SUBMISSION_ID,
                        principalTable: "WF_SUBMISSIONS",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "WF_SUBMISSION_EVENTS",
                columns: table => new
                {
                    ID = table.Column<int>(type: "NUMBER(10)", nullable: false)
                        .Annotation("Oracle:Identity", "START WITH 1 INCREMENT BY 1"),
                    SUBMISSION_ID = table.Column<int>(type: "NUMBER(10)", nullable: false),
                    SUBMISSION_REVISION_NO = table.Column<int>(type: "NUMBER(10)", nullable: false),
                    STATUS = table.Column<string>(type: "NVARCHAR2(50)", maxLength: 50, nullable: false),
                    STATUS_CHANGED_BY_USER_ID = table.Column<int>(type: "NUMBER(10)", nullable: false),
                    STATUS_CHANGED_AT = table.Column<DateTime>(type: "TIMESTAMP(3)", precision: 3, nullable: false),
                    COMMENT = table.Column<string>(type: "NVARCHAR2(1000)", maxLength: 1000, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WF_SUBMISSION_EVENTS", x => x.ID);
                    table.ForeignKey(
                        name: "FK_WF_SUBMISSION_EVENTS_SEC_USERS_STATUS_CHANGED_BY_USER_ID",
                        column: x => x.STATUS_CHANGED_BY_USER_ID,
                        principalTable: "SEC_USERS",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_WF_SUBMISSION_EVENTS_WF_SUBMISSIONS_SUBMISSION_ID",
                        column: x => x.SUBMISSION_ID,
                        principalTable: "WF_SUBMISSIONS",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "WF_SUBMISSIONS_SUBJECTS_ORG_UNITS",
                columns: table => new
                {
                    SUBMISSION_ID = table.Column<int>(type: "NUMBER(10)", nullable: false),
                    SUBJECT_ORG_UNIT_ID = table.Column<int>(type: "NUMBER(10)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WF_SUBMISSIONS_SUBJECTS_ORG_UNITS", x => new { x.SUBMISSION_ID, x.SUBJECT_ORG_UNIT_ID });
                    table.ForeignKey(
                        name: "FK_WF_SUBMISSIONS_SUBJECTS_ORG_UNITS_REF_ORGANIZATIONAL_UNITS_SUBJECT_ORG_UNIT_ID",
                        column: x => x.SUBJECT_ORG_UNIT_ID,
                        principalTable: "REF_ORGANIZATIONAL_UNITS",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_WF_SUBMISSIONS_SUBJECTS_ORG_UNITS_WF_SUBMISSIONS_SUBMISSION_ID",
                        column: x => x.SUBMISSION_ID,
                        principalTable: "WF_SUBMISSIONS",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "INP_VALUES_FOR_ALE_ODOIPORIKON",
                columns: table => new
                {
                    ID = table.Column<int>(type: "NUMBER(10)", nullable: false)
                        .Annotation("Oracle:Identity", "START WITH 1 INCREMENT BY 1"),
                    ENTRY_ID = table.Column<int>(type: "NUMBER(10)", nullable: false),
                    ALE_ID = table.Column<int>(type: "NUMBER(10)", nullable: false),
                    VALUE = table.Column<decimal>(type: "DECIMAL(18,2)", precision: 18, scale: 2, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_INP_VALUES_FOR_ALE_ODOIPORIKON", x => x.ID);
                    table.ForeignKey(
                        name: "FK_INP_VALUES_FOR_ALE_ODOIPORIKON_INP_YPODEIGMATA_ENTRIES_ENTRY_ID",
                        column: x => x.ENTRY_ID,
                        principalTable: "INP_YPODEIGMATA_ENTRIES",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_INP_VALUES_FOR_ALE_ODOIPORIKON_REF_ALE_ALE_ID",
                        column: x => x.ALE_ID,
                        principalTable: "REF_ALE",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CALC_ST1_MIKTES_APODOXES_ANA_ETOS_ORG_UNIT_STOIXEIO_KOSTOUS_ORG_UNIT_ID",
                table: "CALC_ST1_MIKTES_APODOXES_ANA_ETOS_ORG_UNIT_STOIXEIO_KOSTOUS",
                column: "ORG_UNIT_ID");

            migrationBuilder.CreateIndex(
                name: "IX_CALC_ST1_MIKTES_APODOXES_ANA_ETOS_ORG_UNIT_STOIXEIO_KOSTOUS_STOIXEIO_KOSTOUS_ID",
                table: "CALC_ST1_MIKTES_APODOXES_ANA_ETOS_ORG_UNIT_STOIXEIO_KOSTOUS",
                column: "STOIXEIO_KOSTOUS_ID");

            migrationBuilder.CreateIndex(
                name: "IX_INP_ST1_TOPOTHETISEIS_PROSOPIKOU_ETOS_ANAFORAS_ORG_UNIT_ID",
                table: "INP_ST1_TOPOTHETISEIS_PROSOPIKOU",
                columns: new[] { "ETOS_ANAFORAS", "ORG_UNIT_ID" });

            migrationBuilder.CreateIndex(
                name: "IX_INP_ST1_TOPOTHETISEIS_PROSOPIKOU_ETOS_ANAFORAS_PEBADA_ID",
                table: "INP_ST1_TOPOTHETISEIS_PROSOPIKOU",
                columns: new[] { "ETOS_ANAFORAS", "PEBADA_ID" });

            migrationBuilder.CreateIndex(
                name: "IX_INP_ST1_TOPOTHETISEIS_PROSOPIKOU_HSTR_ID_MONADAS",
                table: "INP_ST1_TOPOTHETISEIS_PROSOPIKOU",
                column: "HSTR_ID_MONADAS");

            migrationBuilder.CreateIndex(
                name: "IX_INP_ST1_TOPOTHETISEIS_PROSOPIKOU_ORG_UNIT_ID",
                table: "INP_ST1_TOPOTHETISEIS_PROSOPIKOU",
                column: "ORG_UNIT_ID");

            migrationBuilder.CreateIndex(
                name: "IX_INP_ST1_TOPOTHETISEIS_PROSOPIKOU_PEBADA_ID",
                table: "INP_ST1_TOPOTHETISEIS_PROSOPIKOU",
                column: "PEBADA_ID");

            migrationBuilder.CreateIndex(
                name: "IX_INP_ST1_TOPOTHETISEIS_PROSOPIKOU_STOIXEIO_KOSTOUS_ID",
                table: "INP_ST1_TOPOTHETISEIS_PROSOPIKOU",
                column: "STOIXEIO_KOSTOUS_ID");

            migrationBuilder.CreateIndex(
                name: "IX_INP_VALUES_FOR_ALE_ODOIPORIKON_ALE_ID",
                table: "INP_VALUES_FOR_ALE_ODOIPORIKON",
                column: "ALE_ID");

            migrationBuilder.CreateIndex(
                name: "IX_INP_VALUES_FOR_ALE_ODOIPORIKON_ENTRY_ID_ALE_ID",
                table: "INP_VALUES_FOR_ALE_ODOIPORIKON",
                columns: new[] { "ENTRY_ID", "ALE_ID" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_INP_YPODEIGMATA_ENTRIES_MOIRA_ORG_UNIT_ID",
                table: "INP_YPODEIGMATA_ENTRIES",
                column: "MOIRA_ORG_UNIT_ID");

            migrationBuilder.CreateIndex(
                name: "IX_INP_YPODEIGMATA_ENTRIES_MONADA_ORG_UNIT_ID",
                table: "INP_YPODEIGMATA_ENTRIES",
                column: "MONADA_ORG_UNIT_ID");

            migrationBuilder.CreateIndex(
                name: "IX_INP_YPODEIGMATA_ENTRIES_STOIXEIO_KOSTOUS_ID",
                table: "INP_YPODEIGMATA_ENTRIES",
                column: "STOIXEIO_KOSTOUS_ID");

            migrationBuilder.CreateIndex(
                name: "IX_INP_YPODEIGMATA_ENTRIES_SUBMISSION_ID_SUBMISSION_REVISION_NO",
                table: "INP_YPODEIGMATA_ENTRIES",
                columns: new[] { "SUBMISSION_ID", "SUBMISSION_REVISION_NO" });

            migrationBuilder.CreateIndex(
                name: "IX_REF_ALE_KODIKOS",
                table: "REF_ALE",
                column: "KODIKOS",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_REF_ORGANIZATIONAL_UNITS_HSTR_ID",
                table: "REF_ORGANIZATIONAL_UNITS",
                column: "HSTR_ID",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_REF_ORGANIZATIONAL_UNITS_PARENT_ID",
                table: "REF_ORGANIZATIONAL_UNITS",
                column: "PARENT_ID");

            migrationBuilder.CreateIndex(
                name: "IX_REF_STOIXEIA_KOSTOUS_KYRIO_STOIXEIO_ID",
                table: "REF_STOIXEIA_KOSTOUS",
                column: "KYRIO_STOIXEIO_ID");

            migrationBuilder.CreateIndex(
                name: "IX_REF_TYPOI_PTITIKON_MESON_KATIGORIA_PTITIKOU_MESOU_ID",
                table: "REF_TYPOI_PTITIKON_MESON",
                column: "KATIGORIA_PTITIKOU_MESOU_ID");

            migrationBuilder.CreateIndex(
                name: "IX_REF_TYPOI_PTITIKON_MESON_ORG_UNITS_ORG_UNIT_ID",
                table: "REF_TYPOI_PTITIKON_MESON_ORG_UNITS",
                column: "ORG_UNIT_ID");

            migrationBuilder.CreateIndex(
                name: "IX_YpodeigmaSubmissionScopes_RESPONSIBLE_ORG_UNIT_ID",
                table: "REF_YPODEIGMA_SUBMISSION_SCOPES",
                column: "RESPONSIBLE_ORG_UNIT_ID");

            migrationBuilder.CreateIndex(
                name: "IX_YpodeigmaSubmissionScopes_SUBJECT_ORG_UNIT_ID",
                table: "REF_YPODEIGMA_SUBMISSION_SCOPES",
                column: "SUBJECT_ORG_UNIT_ID");

            migrationBuilder.CreateIndex(
                name: "IX_YpodeigmaSubmissionScopes_YPODEIGMA_ID",
                table: "REF_YPODEIGMA_SUBMISSION_SCOPES",
                column: "YPODEIGMA_ID");

            migrationBuilder.CreateIndex(
                name: "IX_YpodeigmaSubmissionScopes_YPODEIGMA_ID_RESPONSIBLE_ORG_UNIT_ID",
                table: "REF_YPODEIGMA_SUBMISSION_SCOPES",
                columns: new[] { "YPODEIGMA_ID", "RESPONSIBLE_ORG_UNIT_ID" });

            migrationBuilder.CreateIndex(
                name: "IX_REF_YPODEIGMATA_KYRIO_STOIXEIO_ID",
                table: "REF_YPODEIGMATA",
                column: "KYRIO_STOIXEIO_ID");

            migrationBuilder.CreateIndex(
                name: "IX_SEC_ACCESS_GRANTS_GRANTEE_ORG_UNIT_ID",
                table: "SEC_ACCESS_GRANTS",
                column: "GRANTEE_ORG_UNIT_ID");

            migrationBuilder.CreateIndex(
                name: "IX_SEC_ACCESS_GRANTS_GRANTEE_USER_ID",
                table: "SEC_ACCESS_GRANTS",
                column: "GRANTEE_USER_ID");

            migrationBuilder.CreateIndex(
                name: "IX_SEC_ACCESS_GRANTS_INSERTED_BY_USER_ID",
                table: "SEC_ACCESS_GRANTS",
                column: "INSERTED_BY_USER_ID");

            migrationBuilder.CreateIndex(
                name: "IX_SEC_ACCESS_GRANTS_RESPONSIBLE_ORG_UNIT_ID",
                table: "SEC_ACCESS_GRANTS",
                column: "RESPONSIBLE_ORG_UNIT_ID");

            migrationBuilder.CreateIndex(
                name: "IX_SEC_ACCESS_GRANTS_YPODEIGMA_ID_RESPONSIBLE_ORG_UNIT_ID",
                table: "SEC_ACCESS_GRANTS",
                columns: new[] { "YPODEIGMA_ID", "RESPONSIBLE_ORG_UNIT_ID" });

            migrationBuilder.CreateIndex(
                name: "IX_SEC_USERS_AMA",
                table: "SEC_USERS",
                column: "AMA");

            migrationBuilder.CreateIndex(
                name: "IX_SEC_USERS_EXTERNAL_ID",
                table: "SEC_USERS",
                column: "EXTERNAL_ID",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_SEC_USERS_ORG_UNIT_ID",
                table: "SEC_USERS",
                column: "ORG_UNIT_ID");

            migrationBuilder.CreateIndex(
                name: "IX_SEC_USERS_ROLES_INSERTED_BY_USER_ID",
                table: "SEC_USERS_ROLES",
                column: "INSERTED_BY_USER_ID");

            migrationBuilder.CreateIndex(
                name: "IX_WF_SUBMISSION_EVENTS_STATUS",
                table: "WF_SUBMISSION_EVENTS",
                column: "STATUS");

            migrationBuilder.CreateIndex(
                name: "IX_WF_SUBMISSION_EVENTS_STATUS_CHANGED_BY_USER_ID",
                table: "WF_SUBMISSION_EVENTS",
                column: "STATUS_CHANGED_BY_USER_ID");

            migrationBuilder.CreateIndex(
                name: "IX_WF_SUBMISSION_EVENTS_SUBMISSION_ID_SUBMISSION_REVISION_NO",
                table: "WF_SUBMISSION_EVENTS",
                columns: new[] { "SUBMISSION_ID", "SUBMISSION_REVISION_NO" });

            migrationBuilder.CreateIndex(
                name: "IX_WF_SUBMISSIONS_CREATED_BY_USER_ID",
                table: "WF_SUBMISSIONS",
                column: "CREATED_BY_USER_ID");

            migrationBuilder.CreateIndex(
                name: "IX_WF_SUBMISSIONS_RESPONSIBLE_ORG_UNIT_ID",
                table: "WF_SUBMISSIONS",
                column: "RESPONSIBLE_ORG_UNIT_ID");

            migrationBuilder.CreateIndex(
                name: "IX_WF_SUBMISSIONS_UPDATED_BY_USER_ID",
                table: "WF_SUBMISSIONS",
                column: "UPDATED_BY_USER_ID");

            migrationBuilder.CreateIndex(
                name: "IX_WF_SUBMISSIONS_YPODEIGMA_ID_ETOS_ANAFORAS_RESPONSIBLE_ORG_UNIT_ID",
                table: "WF_SUBMISSIONS",
                columns: new[] { "YPODEIGMA_ID", "ETOS_ANAFORAS", "RESPONSIBLE_ORG_UNIT_ID" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_SubmissionSubjectOrgUnits_SUBJECT_ORG_UNIT_ID",
                table: "WF_SUBMISSIONS_SUBJECTS_ORG_UNITS",
                column: "SUBJECT_ORG_UNIT_ID");

            migrationBuilder.CreateIndex(
                name: "IX_SubmissionSubjectOrgUnits_SUBMISSION_ID",
                table: "WF_SUBMISSIONS_SUBJECTS_ORG_UNITS",
                column: "SUBMISSION_ID");

            migrationBuilder.Sql(
                """
                CREATE UNIQUE INDEX "UX_SEC_ACCESS_GRANTS_USER"
                ON "SEC_ACCESS_GRANTS"
                (
                    CASE WHEN "GRANTEE_USER_ID" IS NOT NULL
                        THEN "GRANTEE_USER_ID" END,

                    CASE WHEN "GRANTEE_USER_ID" IS NOT NULL
                        THEN "YPODEIGMA_ID" END,

                    CASE WHEN "GRANTEE_USER_ID" IS NOT NULL
                        THEN "RESPONSIBLE_ORG_UNIT_ID" END
                )
                """);

            migrationBuilder.Sql(
                """
                CREATE UNIQUE INDEX "UX_SEC_ACCESS_GRANTS_ORG_UNIT"
                ON "SEC_ACCESS_GRANTS"
                (
                    CASE WHEN "GRANTEE_ORG_UNIT_ID" IS NOT NULL
                        THEN "GRANTEE_ORG_UNIT_ID" END,

                    CASE WHEN "GRANTEE_ORG_UNIT_ID" IS NOT NULL
                        THEN "YPODEIGMA_ID" END,

                    CASE WHEN "GRANTEE_ORG_UNIT_ID" IS NOT NULL
                        THEN "RESPONSIBLE_ORG_UNIT_ID" END
                )
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CALC_ST1_MIKTES_APODOXES_ANA_ETOS_ORG_UNIT_STOIXEIO_KOSTOUS");

            migrationBuilder.DropTable(
                name: "INP_ST1_TOPOTHETISEIS_PROSOPIKOU");

            migrationBuilder.DropTable(
                name: "INP_VALUES_FOR_ALE_ODOIPORIKON");

            migrationBuilder.DropTable(
                name: "REF_TYPOI_PTITIKON_MESON_ORG_UNITS");

            migrationBuilder.DropTable(
                name: "REF_YPODEIGMA_SUBMISSION_SCOPES");

            migrationBuilder.DropTable(
                name: "SEC_ACCESS_GRANTS");

            migrationBuilder.DropTable(
                name: "SEC_USERS_ROLES");

            migrationBuilder.DropTable(
                name: "WF_SUBMISSION_EVENTS");

            migrationBuilder.DropTable(
                name: "WF_SUBMISSIONS_SUBJECTS_ORG_UNITS");

            migrationBuilder.DropTable(
                name: "INP_YPODEIGMATA_ENTRIES");

            migrationBuilder.DropTable(
                name: "REF_ALE");

            migrationBuilder.DropTable(
                name: "REF_TYPOI_PTITIKON_MESON");

            migrationBuilder.DropTable(
                name: "REF_STOIXEIA_KOSTOUS");

            migrationBuilder.DropTable(
                name: "WF_SUBMISSIONS");

            migrationBuilder.DropTable(
                name: "REF_KATIGORIES_PTITIKON_MESON");

            migrationBuilder.DropTable(
                name: "REF_YPODEIGMATA");

            migrationBuilder.DropTable(
                name: "SEC_USERS");

            migrationBuilder.DropTable(
                name: "REF_KYRIA_STOIXEIA");

            migrationBuilder.DropTable(
                name: "REF_ORGANIZATIONAL_UNITS");
        }
    }
}
