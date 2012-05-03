package org.moyax.compiler;

import java.io.File;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import javax.tools.Diagnostic;
import javax.tools.DiagnosticCollector;
import javax.tools.JavaCompiler;
import javax.tools.JavaFileObject;
import javax.tools.StandardJavaFileManager;

/**
 * Represents a compilation context. In a context all files are compiled using
 * the same file manager and results are kept until the next compilation.
 *
 * @author Matias Mirabelli &lt;lumen.night@gmail&gt;
 * @since 0.0.1
 */
public class CompilerContext {

  /** System compiler used to build java source files. Cannot be null. */
  private final JavaCompiler compiler;

  /** File manager that contains the files to compile. */
  private final StandardJavaFileManager fileManager;

  /** Keeps the list of compilation results. Cannot be null. */
  private DiagnosticCollector<JavaFileObject> diagnosticCollector;

  /** List of files to compile within this context. Cannot be null. */
  private List<File> files = new ArrayList<File>();

  /**
   * Creates a new facade and sets the compiler used to build java source files.
   *
   * @param theCompiler Compiler to build files. Cannot be null.
   */
  public CompilerContext(final JavaCompiler theCompiler) {
    compiler = theCompiler;
    diagnosticCollector = new DiagnosticCollector<JavaFileObject>();
    fileManager = compiler
        .getStandardFileManager(diagnosticCollector, null, null);
  }

  /**
   * Adds a collection of source files to this build context.
   *
   * @param theFiles List of files to add. Cannot be null.
   */
  public void addSourceFiles(final Collection<File> theFiles) {
    files.addAll(theFiles);
  }

  /**
   * Returns the list of results produced in the last call to
   * {@link #compile()}.
   *
   * @return A list of diagnostics. An empty list if the compilation succeed.
   *    Never returns null.
   */
  public List<Diagnostic<? extends JavaFileObject>> getDiagnostics() {
    return diagnosticCollector.getDiagnostics();
  }

  /**
   * Compiles all files in this context. If there're errors
   * {@link #getDiagnostics()} returns a list of results with further
   * information.
   *
   * @return Returns <code>true</code> if the compilation succeed,
   *    <code>false</code> otherwise.
   */
  public boolean compile() {
    Iterable<? extends JavaFileObject> sources = fileManager
        .getJavaFileObjectsFromFiles(files);

    compiler.getTask(null, fileManager, diagnosticCollector, null, null,
        sources).call();

    return diagnosticCollector.getDiagnostics().size() == 0;
  }
}
