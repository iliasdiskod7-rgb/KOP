using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace KOP.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class RenameSubmissionSubjectOrgUnitsTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_WF_SUBMISSIONS_SUBJECTS_ORG_UNITS_REF_ORGANIZATIONAL_UNITS_SUBJECT_ORG_UNIT_ID",
                table: "WF_SUBMISSIONS_SUBJECTS_ORG_UNITS");

            migrationBuilder.DropForeignKey(
                name: "FK_WF_SUBMISSIONS_SUBJECTS_ORG_UNITS_WF_SUBMISSIONS_SUBMISSION_ID",
                table: "WF_SUBMISSIONS_SUBJECTS_ORG_UNITS");

            migrationBuilder.DropPrimaryKey(
                name: "PK_WF_SUBMISSIONS_SUBJECTS_ORG_UNITS",
                table: "WF_SUBMISSIONS_SUBJECTS_ORG_UNITS");

            migrationBuilder.RenameTable(
                name: "WF_SUBMISSIONS_SUBJECTS_ORG_UNITS",
                newName: "WF_SUBMISSION_SUBJECT_ORG_UNITS");

            migrationBuilder.AddPrimaryKey(
                name: "PK_WF_SUBMISSION_SUBJECT_ORG_UNITS",
                table: "WF_SUBMISSION_SUBJECT_ORG_UNITS",
                columns: new[] { "SUBMISSION_ID", "SUBJECT_ORG_UNIT_ID" });

            migrationBuilder.AddForeignKey(
                name: "FK_WF_SUBMISSION_SUBJECT_ORG_UNITS_REF_ORGANIZATIONAL_UNITS_SUBJECT_ORG_UNIT_ID",
                table: "WF_SUBMISSION_SUBJECT_ORG_UNITS",
                column: "SUBJECT_ORG_UNIT_ID",
                principalTable: "REF_ORGANIZATIONAL_UNITS",
                principalColumn: "ID",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_WF_SUBMISSION_SUBJECT_ORG_UNITS_WF_SUBMISSIONS_SUBMISSION_ID",
                table: "WF_SUBMISSION_SUBJECT_ORG_UNITS",
                column: "SUBMISSION_ID",
                principalTable: "WF_SUBMISSIONS",
                principalColumn: "ID",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_WF_SUBMISSION_SUBJECT_ORG_UNITS_REF_ORGANIZATIONAL_UNITS_SUBJECT_ORG_UNIT_ID",
                table: "WF_SUBMISSION_SUBJECT_ORG_UNITS");

            migrationBuilder.DropForeignKey(
                name: "FK_WF_SUBMISSION_SUBJECT_ORG_UNITS_WF_SUBMISSIONS_SUBMISSION_ID",
                table: "WF_SUBMISSION_SUBJECT_ORG_UNITS");

            migrationBuilder.DropPrimaryKey(
                name: "PK_WF_SUBMISSION_SUBJECT_ORG_UNITS",
                table: "WF_SUBMISSION_SUBJECT_ORG_UNITS");

            migrationBuilder.RenameTable(
                name: "WF_SUBMISSION_SUBJECT_ORG_UNITS",
                newName: "WF_SUBMISSIONS_SUBJECTS_ORG_UNITS");

            migrationBuilder.AddPrimaryKey(
                name: "PK_WF_SUBMISSIONS_SUBJECTS_ORG_UNITS",
                table: "WF_SUBMISSIONS_SUBJECTS_ORG_UNITS",
                columns: new[] { "SUBMISSION_ID", "SUBJECT_ORG_UNIT_ID" });

            migrationBuilder.AddForeignKey(
                name: "FK_WF_SUBMISSIONS_SUBJECTS_ORG_UNITS_REF_ORGANIZATIONAL_UNITS_SUBJECT_ORG_UNIT_ID",
                table: "WF_SUBMISSIONS_SUBJECTS_ORG_UNITS",
                column: "SUBJECT_ORG_UNIT_ID",
                principalTable: "REF_ORGANIZATIONAL_UNITS",
                principalColumn: "ID",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_WF_SUBMISSIONS_SUBJECTS_ORG_UNITS_WF_SUBMISSIONS_SUBMISSION_ID",
                table: "WF_SUBMISSIONS_SUBJECTS_ORG_UNITS",
                column: "SUBMISSION_ID",
                principalTable: "WF_SUBMISSIONS",
                principalColumn: "ID",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
